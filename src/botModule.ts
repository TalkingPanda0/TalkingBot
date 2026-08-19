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
  timestamp: Date;
  reply: (message: string, replyToUser: boolean) => void | Promise<void>;
  banUser: (reason: string, duration?: number) => void | Promise<void>;
}

export type MessageListener = (data: MessageData) => void | Promise<void>;
export type DiscordMessageListener = (data: Message) => void | Promise<void>;

export type RedemptionStatus = "FULFILLED" | "CANCELED";
export interface ChannelRedemption {
  id: string;
  broadcasterId: string;
  broadcasterName: string;
  broadcasterDisplayName: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  input: string;
  status: string;
  rewardId: string;
  rewardTitle: string;
  rewardCost: number;
  rewardPrompt: string;
  redemptionDate: Date;

  updateStatus: (newStatus: RedemptionStatus) => Promise<any>;
}

export type ChannelPointRewardStatus = ChannelPointReward & {
  id: string;
  isPaused: boolean;
};

export type ChannelRedemptionListener = (
  data: ChannelRedemption,
) => Promise<void>;

export interface ChannelPointReward {
  autoFulfill?: boolean;
  backgroundColor?: string;
  cost: number;
  globalCooldown?: number | null;
  isEnabled?: boolean;
  maxRedemptionsPerStream?: number | null;
  maxRedemptionsPerUserPerStream?: number | null;
  prompt?: string;
  title: string;
  userInputRequired?: boolean;
}

export interface ModuleContext {
  registerCommand(name: string, command: Command): void;
  onChatMessage(listener: MessageListener): void;
  onDiscordMessage(listener: DiscordMessageListener): void;

  channelPointReward(
    reward: ChannelPointReward,
  ): Promise<ChannelPointRewardStatus>;
  removeChannelPoint(rewardId: string): Promise<void>;
  setChannelPointPaused(rewardId: string, paused: boolean): Promise<void>;
  setChannelPointEnabled(rewardId: string, enabled: boolean): Promise<void>;
  onChannelPointReward(
    rewardId: string,
    listener: ChannelRedemptionListener,
  ): void;

  bot: TalkingBot;
}

export abstract class BotModule {
  name: string = "";

  async init(ctx: ModuleContext) {
    console.log(`${this.name} loaded!`);
  }

  onUnload() {
    console.log(`${this.name} unloaded!`);
  }
}
