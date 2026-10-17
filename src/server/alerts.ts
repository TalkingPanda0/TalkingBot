import { Namespace } from "socket.io";
import { readdir } from "node:fs/promises";
import {
  AlertEvent,
  BitsAlert,
  DiscordJoinAlert,
  FollowAlert,
  KofiAlert,
  RaidAlert,
  SubAlert,
  TTSAlert,
} from "../shared/types.ts";

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

export interface EmoteElement {
  type: "emote";
  emote: string;
}

export interface TextElement {
  type: "text";
  text: string;
  voice: string;
}

export type TTSElement = EmoteElement | TextElement;

export async function getTTSSounds(): Promise<string[]> {
  const files = await readdir(__dirname + "/../../config/sounds");
  return files
    .filter((file) => file.endsWith(".mp3"))
    .map((file) => file.replace(/.mp3$/, ""));
}

async function getEmoteAudio(element: EmoteElement): Promise<string | null> {
  return `/${encodeURIComponent(element.emote)}.mp3`;
}

async function getTTSAudio(element: TextElement): Promise<string | null> {
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

export async function getDiscordJoinAudio(name: string): Promise<string[]> {
  return await getAudioList(`${name} just joined the fish tank.`);
}

export async function getFollowAudio(name: string): Promise<string[]> {
  return await getAudioList(`${name} just followed.`);
}

export async function getCheerAudio(
  name: string,
  bits: number,
  message: string,
): Promise<string[]> {
  if (bits == 1 && message) return await getAudioList(message);
  return await getAudioList(
    `${name} cheered ${bits} ${bits == 1 ? "bit" : "bits"} ${message ? `: \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ ${message}` : ""}`,
  );
}

export async function getKofiAudio(
  name: string,
  sub: boolean,
  tierName: string,
  amount: string,
  currency: string,
): Promise<string[]> {
  return await getAudioList(
    name +
      (sub
        ? ` became a ${tierName != null ? tierName : amount + " " + currency} member!`
        : ` donated ${amount} ${currency}!`),
  );
}

export async function getRaidAudio(
  name: string,
  viewers: number,
): Promise<string[]> {
  return await getAudioList(
    `${name} just raided with ${viewers} ${viewers == 1 ? "hapboo" : "hapboos"}!`,
  );
}

export async function getSubAudio(name: string): Promise<string[]> {
  return await getAudioList(name);
}

export function parseText(text: string): TextElement[] {
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

async function parseElements(text: string): Promise<TTSElement[]> {
  if (!text) return [];
  let elements: TTSElement[] = [];

  let match;
  let lastIndex = 0;
  const soundEffectRegex = new RegExp(
    `(${(await getTTSSounds())
      .map((sound) => sound.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
      .join("|")})`,
    "g",
  );

  while ((match = soundEffectRegex.exec(text)) !== null) {
    elements = elements.concat(parseText(text.slice(lastIndex, match.index)));

    elements.push({ type: "emote", emote: match[0] });
    lastIndex = match.index + match[0].length;
  }
  elements = elements.concat(parseText(text.slice(lastIndex)));
  return elements;
}

export async function getAudioList(text: string): Promise<string[]> {
  const elements = await parseElements(text);
  return (
    await Promise.all(
      elements.map(async (element) =>
        element.type == "emote"
          ? await getEmoteAudio(element)
          : await getTTSAudio(element),
      ),
    )
  ).filter((e) => e != null);
}

export class AlertsManager {
  public io: Namespace;
  public ttsEnabled = false;

  public skip() {
    this.io.emit("skip");
  }

  public async sendTTS(data: TTSAlert) {
    if (!this.ttsEnabled && !data.isImportant) return;
    this.emitAlert({
      audioList: await getAudioList(data.text),
      ...data,
      messageAudioList: null,
    });
  }

  public async raidAlert(alert: RaidAlert) {
    this.emitAlert({
      audioList: await getRaidAudio(alert.raider, alert.viewers),
      ...alert,
      messageAudioList: null,
    });
  }

  public async followAlert(alert: FollowAlert) {
    this.emitAlert({
      audioList: await getFollowAudio(alert.follower),
      ...alert,
      messageAudioList: null,
    });
  }

  public async bitsAlert(alert: BitsAlert,spokenMessage: string) {
    this.emitAlert({
      audioList: await getCheerAudio(alert.user, alert.bits, spokenMessage),
      ...alert,
      messageAudioList: null,
    });
  }

  public async discordJoinAlert(alert: DiscordJoinAlert) {
    this.emitAlert({
      audioList: await getDiscordJoinAudio(alert.member),
      ...alert,
      messageAudioList: null,
    });
  }

  public async kofiAlert(alert: KofiAlert) {
    this.emitAlert({
      audioList: await getKofiAudio(
        alert.sender,
        alert.is_subscription,
        alert.tier_name ?? "",
        alert.amount,
        alert.currency,
      ),
      ...alert,
      messageAudioList: null,
    });
  }

  public async subAlert(alert: SubAlert,spokenMessage: string | null) {
    this.emitAlert({
      audioList: await getSubAudio(alert.name),
      ...alert,
      messageAudioList: spokenMessage ? await getSubAudio(spokenMessage) : [],
    });
  }

  public async emitAlert(alert: AlertEvent) {
    this.io.emit("alert", alert);
  }

  constructor(io: Namespace) {
    this.io = io;
  }
}
