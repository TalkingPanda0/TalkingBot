import { MessageData } from "botModule";
import { TalkingBot } from "./talkingbot";
import { chatMessages } from "./db/schema";
import { sql } from "drizzle-orm";

export class ChatLogger {
  private bot: TalkingBot;

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  // date like "2025-10-26"
  public async getMessages(date: string): Promise<MessageData[]> {
    const messages = await this.bot.database.database
      .select()
      .from(chatMessages)
      .where(sql`date(${chatMessages.timestamp}) = date(${date})`);
    return messages.map((message) => {
      return {
        ...message,
        badges: JSON.parse(message.badges),
        timestamp: new Date(message.timestamp),
        isUserMod: message.isUserMod != 0,
        isUserVip: (message.isUserVip ?? 0) != 0,
        isUserSub: (message.isUserSub ?? 0) != 0,
        isFirst: (message.isFirst ?? 0) != 0,
        isCommand: message.isCommand != 0,
        isOld: message.isOld != 0,
        reply: () => {},
        banUser: () => {},
      } as MessageData;
    });
  }

  public async recordMessage(message: MessageData) {
    this.bot.database.database.insert(chatMessages).values({
      ...message,
      isUserMod: message.isUserMod ? 1 : 0,
      isUserVip: message.isUserVip ? 1 : 0,
      isUserSub: message.isUserSub ? 1 : 0,
      isFirst: message.isFirst ? 1 : 0,
      isCommand: message.isCommand ? 1 : 0,
      isOld: message.isOld ? 1 : 0,
      badges: JSON.stringify(message.badges),
      timestamp: message.timestamp.toISOString(),
    });
  }
}
