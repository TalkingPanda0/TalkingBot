import { MessageData } from "botModule";
import { TalkingBot } from "./talkingbot";

export class LevelManager {
  recentChatters: Set<string> = new Set();
  bot: TalkingBot;
  interval: Timer | null = null;

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  public onStreamOnline() {
    this.interval = setInterval(() => {
      this.levelUp();
    }, 60 * 1000);
  }

  public onStreamOffline() {
    if (this.interval == null) return;
    clearInterval(this.interval);
    this.interval = null;
  }

  public async addRecentChatter(data: MessageData) {
    if (data.isOld) return;
    const chatter: string = `${data.platform}-${data.senderId}`;
    const chatPoints = this.getChatPoints(chatter);
    const level = this.chatPointsToLevel(chatPoints);
    if (
      !this.recentChatters.has(chatter) &&
      level < this.chatPointsToLevel(chatPoints + 1)
    )
      await data.reply(
        `You dir it ${data.sender}! You are now level ${level + 1}!`,
        true,
      );

    this.recentChatters.add(chatter);
  }

  async levelUp() {
    if (!this.bot.twitch.isStreamOnline) return;

    const levels = (await this.bot.database.getOrSetConfig(
      "levels",
      {},
    )) as any;

    for (const chatter of this.recentChatters) {
      levels[chatter] = levels[chatter] ? levels[chatter] + 1 : 1;
    }

    this.recentChatters.clear();

    this.bot.database.setConfig("levels", JSON.stringify(levels));
  }

  getChatPoints(chatter: string) {
    const levels = this.bot.database.getOrSetConfig("levels", {}) as any;

    return levels[chatter];
  }

  chatPointsToLevel(points: number) {
    //level = (1.5th root of chat points)/8
    const level = Math.pow(points, 1 / 1.5) / 8;
    return Math.floor(level);
  }
}
