interface BTTVEmote {
  id: string;
  code: string;
}
interface BTTVUserInfo {
  channelEmotes: BTTVEmote[];
  sharedEmotes: BTTVEmote[];
}
export async function getBTTVEmotes(
  userId: string,
): Promise<Map<string, string>> {
  const emotes = new Map<string, string>();
  const channelInfo: BTTVUserInfo = await (
    await fetch(`https://api.betterttv.net/3/cached/users/twitch/${userId}`)
  ).json();
  const globalEmotes: BTTVEmote[] = await (
    await fetch("https://api.betterttv.net/3/cached/emotes/global")
  ).json();
  channelInfo.channelEmotes.forEach((value) => {
    emotes.set(value.code, value.id);
  });
  channelInfo.sharedEmotes.forEach((value) => {
    emotes.set(value.code, value.id);
  });

  globalEmotes.forEach((value) => {
    emotes.set(value.code, value.id);
  });
  return emotes;
}
