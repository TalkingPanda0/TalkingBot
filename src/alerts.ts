import { getAudioList } from "./tts";

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
  if (bits == 1 && !message) return await getAudioList(message);
  return await getAudioList(
    `${name} cheered ${bits} ${bits == 1 ? "bit" : "bits"} ${message ? `: \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ ${message}` : ""}`,
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
    `${name} raided with ${viewers} ${viewers == 1 ? "hapboo" : "hapboos"}`,
  );
}

export async function getSubAudio(name: string): Promise<string[]> {
  return await getAudioList(name);
}
