import { MessageData } from "botModule";
import { TalkingBot } from "./talkingbot.ts";
import { OverlayMessageData, StoredMessageData } from "../shared/types.ts";
import {
  badges,
  chatMessages,
  messageBadges,
  platforms,
  users,
} from "./db/schema.ts";
import { sql } from "drizzle-orm";

export class ChatLogger {
  private bot: TalkingBot;

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  // date like "2025-10-26"
  public async getMessages(date: string): Promise<StoredMessageData[]> {
    const [y, m, d] = date.split("-").map(Number);
    const before = new Date(y,m -1,d + 1);
    const after = new Date(y,m -1,d);
    console.log(before.getTime());
    console.log(after.getTime());
    const msgs = await this.bot.database.db.query.chatMessages.findMany({
      where: {
        timestamp: { gte: after, lt: before }
      },
      with: {
        platformInfo: true,
        badges: { with: { badge: true } },
        sender: true,
      },
    });
    console.log(msgs);
    return msgs.map((msg) => {
      return {
        messageId: msg.messageId,
        platform: msg.platformInfo.name,
        badges: msg.badges.map((b) => b.badge.url),
        displayName: msg.displayName,
        color: msg.color,
        userId: msg.userId,
        message: msg.message,
        emoteOffsets: msg.emoteOffsets,
        replyId: msg.replyId,
        timestamp: msg.timestamp.getTime(),
        isAction: msg.isAction ?? false,
        highlightMessage: msg.highlightMessage,
        highlightColor: msg.highlightColor,
      };
    });
  }

  public async recordMessage(message: StoredMessageData) {
    return this.bot.database.db.transaction((tx) => {
      const platformId = this.bot.database.getPlatfromId(message.platform);

      tx.insert(users)
        .values({
          userId: message.userId,
          platform: platformId,
          displayName: message.displayName,
          color: message.color,
        })
        .onConflictDoNothing()
        .run();

      const inserted = tx
        .insert(chatMessages)
        .values({
          messageId: message.messageId,
          platform: platformId,
          displayName: message.displayName,
          color: message.color,
          userId: message.userId,
          message: message.message,
          emoteOffsets: message.emoteOffsets,
          replyId: message.replyId,
          isAction: message.isAction,
          highlightMessage: message.highlightMessage,
          highlightColor: message.highlightColor,
          timestamp: new Date(message.timestamp), // column is timestamp_ms
        })
        .onConflictDoNothing()
        .returning({ messageId: chatMessages.messageId })
        .get();

      if (!inserted) {
        console.error(
          `Failed inserting message: ${message.displayName}: ${message.message}`,
        );
        return;
      }

      const badgeUrls = [...new Set(message.badges)];
      if (badgeUrls.length === 0) return true;

      const badgeRows = tx
        .insert(badges)
        .values(badgeUrls.map((url) => ({ url })))
        .onConflictDoUpdate({
          target: badges.url,
          set: { url: sql`excluded.url` },
        })
        .returning({ id: badges.id })
        .all();

      tx.insert(messageBadges)
        .values(
          badgeRows.map((b) => ({
            messageId: message.messageId,
            platform: platformId,
            badgeId: b.id,
          })),
        )
        .run();

      return true;
    });
  }
}
