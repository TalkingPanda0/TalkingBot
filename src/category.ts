import { TalkingBot } from "./talkingbot.ts";


async function getGameName(bot: TalkingBot) {
    return fetch(
        `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${bot.commandHandler.keys.steam}&steamids=76561198800357802`,
        {method: "GET"}
    ).then(
        (response) => response.json()
    ).then(
        (data) => {return data.response.players[0].gameextrainfo}
    );
}

export async function updateCategory(bot: TalkingBot) {
    const name = await getGameName(bot);
    if (!name) return;

    const game = await bot.twitch.apiClient.search.searchCategories(name, {limit: 1});
    const gameid = game.data[0].id;
    if (!gameid) return;

    await bot.twitch.apiClient.channels.updateChannelInfo(
        bot.twitch.channel.id,
        { gameId: gameid }
    );
}