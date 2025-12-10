import { Namespace } from "socket.io";
import { readdir } from "node:fs/promises";

const TTS_VOICES = [
  "Brian",
  "Amy",
  "Emma",
  "Geraint",
  "Russell",
  "Nicole",
  "Joey",
  "Justin",
  "Matthew",
  "Ivy",
  "Joanna",
  "Kendra",
  "Kimberly",
  "Salli",
  "Raveena",
];

export interface TTSData {
  text: string;
  parsedText: string;
  sender: string;
  color: string;
  isImportant: boolean;
}

interface EmoteElement {
  type: "emote";
  emote: string;
}

interface TextElement {
  type: "text";
  text: string;
  voice: string;
}

type TTSElement = EmoteElement | TextElement;

export async function getTTSSounds(): Promise<string[]> {
  const files = await readdir(__dirname + "/../config/sounds");
  return files
    .filter((file) => file.endsWith(".mp3"))
    .map((file) => file.replace(/.mp3$/, ""));
}

export class TTSManager {
  public io: Namespace;
  public enabled: boolean;

  public setPause(status: boolean) {
    this.io.emit("pause", status);
  }

  public skip(user: string) {
    this.io.emit("skip", user);
  }
  private async getEmoteAudio(element: EmoteElement): Promise<string | null> {
    return `/${encodeURIComponent(element.emote)}.mp3`;
  }

  private async getTTSAudio(element: TextElement): Promise<string | null> {
    try {
      const response = await fetch(
        `https://streamlabs.com/polly/speak?voice=${element.voice}&text=${encodeURIComponent(element.text)}`,
        {
          headers: {
            Referer: "https://streamlabs.com",
          },
          method: "POST",
        },
      );

      if (!response.ok) {
        console.error(
          `Streamlabs retuned with non ok status: ${await response.text()}`,
        );
        return null;
      }
      const data: { success: boolean; message: string; speak_url: string } =
        await response.json();
      return data.speak_url;
    } catch (e) {
      console.error(`Error while getting tts audio: ${e}`);
      return null;
    }
  }

  private parseText(text: string): TextElement[] {
    if (!text) return [];
    const result: TextElement[] = [];
    let currentVoice = "Brian";
    let buffer = "";

    const tokenRegex = /(.*?)(\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const before = match[1];
      const inside = match[3];

      buffer += before;

      if (TTS_VOICES.includes(inside)) {
        const trimmed = buffer.trim();
        if (trimmed)
          result.push({ type: "text", text: trimmed, voice: currentVoice });
        buffer = "";
        currentVoice = inside;
      } else {
        buffer += match[2];
      }

      lastIndex = tokenRegex.lastIndex;
    }

    buffer += text.slice(lastIndex);
    const tail = buffer.trim();
    if (tail) result.push({ type: "text", text: tail, voice: currentVoice });

    return result;
  }

  private async parseElements(data: TTSData): Promise<TTSElement[]> {
    let elements: TTSElement[] = [];

    let match;
    let lastIndex = 0;
    const soundEffectRegex = new RegExp(
      `(${(await getTTSSounds())
        .map((sound) => sound.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
        .join("|")})`,
      "g",
    );

    while ((match = soundEffectRegex.exec(data.text)) !== null) {
      elements = elements.concat(
        this.parseText(data.text.slice(lastIndex, match.index)),
      );

      elements.push({ type: "emote", emote: match[0] });
      lastIndex = match.index + match[0].length;
    }
    elements = elements.concat(this.parseText(data.text.slice(lastIndex)));
    return elements;
  }

  private async getAudioList(data: TTSData): Promise<string[]> {
    const elements = await this.parseElements(data);
    return (
      await Promise.all(
        elements.map(async (element) =>
          element.type == "emote"
            ? await this.getEmoteAudio(element)
            : await this.getTTSAudio(element),
        ),
      )
    ).filter((e) => e != null);
  }

  public async send(data: TTSData) {
    if (!this.enabled && !data.isImportant) return;
    this.io.emit("message", {
      audioList: await this.getAudioList(data),
      ...data,
    });
  }

  constructor(io: Namespace) {
    this.enabled = false;
    this.io = io;
  }
}
