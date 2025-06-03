import { chat } from "googleapis/build/src/apis/chat";
import { TalkingBot } from "./talkingbot";

export let recentChatters: Set<string> = new Set();

export async function addRecentChatter(bot: TalkingBot, data) {
    const chatter: string = `${data.platform}-${data.senderId}`;
    const chatPoints = getChatPoints(bot, chatter);
    const level = chatPointsToLevel(chatPoints);
    if (!recentChatters.has(chatter) && level < chatPointsToLevel(chatPoints + 1)) await data.reply(`You dir it ${data.sender}! You are now level ${level + 1}!`);

    recentChatters.add(chatter);
}

export function levelUp(bot: TalkingBot) {
    if (!bot.twitch.isStreamOnline) return;

    const levels = JSON.parse(
        bot.database.getOrSetConfig(
            "levels",
            JSON.stringify({})
        )
    );

    for (const chatter of recentChatters) {
        levels[chatter] = levels[chatter] ? levels[chatter] + 1 : 1;
    }

    recentChatters.clear();

    bot.database.setConfig("levels", JSON.stringify(levels));
}

function getChatPoints(bot: TalkingBot, chatter: string) {
    const levels = JSON.parse(
        bot.database.getOrSetConfig(
            "levels",
            JSON.stringify({})
        )
    );

    return levels[chatter];
}

function chatPointsToLevel(points: number) {
    //level = (1.5th root of chat points)/2
    let level = Math.pow(points, 1 / 1.5)/2;
    return Math.floor(level);
}