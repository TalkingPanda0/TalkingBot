import { MessageData } from "botModule";
import { TalkingBot } from "./talkingbot";
import { Database, Statement } from "bun:sqlite";
interface SavedMessageData {
  badges: string;
  isUserMod: boolean;
  isUserVip?: boolean;
  isUserSub?: boolean;
  message: string;
  parsedMessage: string;
  username: string;
  sender: string;
  senderId: string;
  color: string;
  id: string;
  platform: string;
  channelId: string;
  isFirst: boolean;
  replyTo?: string;
  replyId?: string;
  replyText?: string;
  isCommand: boolean;
  rewardName?: string;
  isOld: boolean;
  timestamp: Date;
}

function parseSaved(data: SavedMessageData): MessageData {
  return {
    ...data,
    badges: JSON.parse(data.badges),
    timestamp: new Date(data.timestamp),
  } as MessageData;
}

export class ChatLogger {
  private bot: TalkingBot;
  private database: Database;
  private insertMessage: CallableFunction;
  private getMessagesQuery: Statement;

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.database = this.bot.database.database;
    this.database
      .query(
        "CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, username TEXT NOT NULL, sender TEXT, senderId TEXT, platform TEXT, channelId TEXT, message TEXT, parsedMessage TEXT, badges TEXT, isUserMod INTEGER, isUserVip INTEGER, isUserSub INTEGER, isFirst INTEGER, isCommand INTEGER, rewardName TEXT, replyTo TEXT, replyId TEXT, replyText TEXT,isOld INTEGER,color TEXT,timestamp DATETIME NOT NULL);",
      )
      .run();
    const insertMessageQuery = this.database.prepare(
      "INSERT OR REPLACE INTO chat_messages (id, username, sender, senderId, platform, channelId, message, parsedMessage, badges, isUserMod, isUserVip, isUserSub, isFirst, isCommand, rewardName, replyTo, replyId, replyText, isOld, color, timestamp) VALUES ( $id, $username, $sender, $senderId, $platform, $channelId, $message, $parsedMessage, $badges, $isUserMod, $isUserVip, $isUserSub, $isFirst, $isCommand, $rewardName, $replyTo, $replyId, $replyText, $isOld, $color, $timestamp);",
    );
    this.getMessagesQuery = this.database.prepare(
      " SELECT * FROM chat_messages WHERE date(timestamp) = date(?1) ORDER BY timestamp ASC; `); ",
    );
    this.insertMessage = this.database.transaction((message) => {
      insertMessageQuery.run(message);
    });
  }

  // date like "2025-10-26"
  public getMessages(date: string): MessageData[] {
    const messages = this.getMessagesQuery.all(date) as SavedMessageData[];
    return messages.map(parseSaved);
  }

  public recordMessage(message: MessageData) {
    this.insertMessage({
      ...message,
      badges: JSON.stringify(message.badges),
      timestamp: message.timestamp.toISOString(),
    });
  }
}
