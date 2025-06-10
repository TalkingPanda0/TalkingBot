import { TalkingBot } from "./talkingbot";

let game_name: string | null = null;

async function getGameName(bot: TalkingBot) {
  const response = await fetch(
    `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${bot.commandHandler.keys.steam}&steamids=76561198800357802`,
    { method: "GET" },
  );
  if (!response.ok) return null;

  const json = await response.json();

  return json.response.players[0].gameextrainfo;
}

export async function updateCategory(bot: TalkingBot) {
  const name = await getGameName(bot);
  if (!name || name == game_name) return;
  game_name = name;

  const game = await bot.twitch.apiClient.search.searchCategories(name, {
    limit: 1,
  });
  const data = game.data[0];
  if (!data) return;

  await bot.twitch.apiClient.channels.updateChannelInfo(bot.twitch.channel.id, {
    gameId: data.id,
  });

  await bot.broadcastMessage(`Game has been changed to ${data.name}!`);
}

