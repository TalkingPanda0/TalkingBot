import { TalkingBot } from "./talkingbot";

let currentSteamGame: string | null = null;

async function getGameName(bot: TalkingBot): Promise<string | null> {
  const response = await fetch(
    `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${bot.commandHandler.keys.steam}&steamids=76561198800357802`,
    { method: "GET" },
  );
  if (!response.ok) return null;

  const json = await response.json();

  return json.response.players[0].gameextrainfo;
}

export async function updateCategory(bot: TalkingBot) {
  const newSteamGame = await getGameName(bot);
  if (!newSteamGame || newSteamGame == currentSteamGame) return;
  currentSteamGame = newSteamGame;

  const helixGame = (
    await bot.twitch.apiClient.search.searchCategories(currentSteamGame, {
      limit: 1,
    })
  ).data[0];
  if (!helixGame || bot.twitch.currentGame == helixGame.id) return;

  await bot.twitch.apiClient.channels.updateChannelInfo(bot.twitch.channel.id, {
    gameId: helixGame.id,
  });
  bot.twitch.currentGame = helixGame.id;

  await bot.broadcastMessage(`Game has been changed to ${helixGame.name}!`);
  await bot.discord.onGameChange(
    helixGame.name,
    helixGame.boxArtUrl.replace("52x72", "520x720"),
  );
}
