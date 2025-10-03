import { Message } from "discord.js";
import { Command } from "./commands";
import { TalkingBot } from "./talkingbot";

export interface MessageData {
  badges: string[];
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
  isAction?: boolean;
  isTestRun?: boolean;
  reply: (message: string, replyToUser: boolean) => void | Promise<void>;
  banUser: (reason: string, duration?: number) => void | Promise<void>;
}

export type MessageListener = (data: MessageData) => void;
export type DiscordMessageListener = (data: Message) => void;

export interface ModuleContext {
  registerCommand(name: string, command: Command): void;
  onChatMessage(listener: MessageListener): void;
  onDiscordMessage(listener: DiscordMessageListener): void;
  bot: TalkingBot;
}

export abstract class BotModule {
  name: string = "";

  init(ctx: ModuleContext) {
    console.log(`${this.name} loaded!`);
  }

  onUnload() {
    console.log(`${this.name} unloaded!`);
  }
}
