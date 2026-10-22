import { ApiClient, HelixCheermoteList, HelixUser } from "@twurple/api/lib";
import { ChatClient } from "@twurple/chat/lib";
import { Client, Message } from "discord.js";

declare module "botModule" {
  export class ModuleManager {
    public getModuleStatus(module: string): boolean;

    public reloadModule(module: string): Promise<void>;

    public getModuleList(): { module: string; enabled: boolean }[];

    public enableModule(name: string): Promise<void>;

    public disableModule(name: string): Promise<void>;
  }

  export interface DiscordCommand {
    commandBuilder: any;
    execute: (interaction: any) => Promise<void> | void;
  }

  export class Discord {
    public client: Client;
    public guildId: string;

    public registerDiscordCommand(command: DiscordCommand): Promise<void>;
    public say(message: string, channelId: string): void;

    public onGameChange(name: string, art: string): Promise<void>;
  }

  export class Twitch {
    public apiClient: ApiClient;
    public channel: HelixUser;
    public chatClient: ChatClient;
    public isStreamOnline: boolean;
    public cheerEmotes: HelixCheermoteList;
    public badges: Map<string, string>;
    public currentGame: string | null;
    public getCurrentTitle(): Promise<string | null>;
    public say(message: string): Promise<void>;
  }
  export class Namespace {}
  export class DB {
    public getOrSetConfig<T>(key: string, defaultValue: T): Promise<T>;
    public setConfig<T>(key: string, value: T): Promise<void>;
    public getConfig<T>(key: string): Promise<T | null>;
  }

  export interface latestSub {
    name: string;
    pfpUrl: string;
    time: Date;
  }
  export class TalkingBot {
    /**
     * Will say message in every chat.
     */
    public broadcastMessage(message: string): Promise<void>;
    public discord: Discord;
    public twitch: Twitch;

    public iochat: Namespace;
    public iomodtext: Namespace;
    public iopoll: Namespace;
    public ioalert: Namespace;

    public database: DB;
    public moduleManager: ModuleManager;

    public modtext: string;
    public setLatestSub(sub: latestSub): Promise<void>;
  }

  export interface MessageData {
    // Message Id from the platform
    id: string;
    // Urls of the badges of the user.
    badges: string[];
    displayName: string;
    // Sender's chat color as a css color
    color: string;
    message: string;
    // String containg emote id's and their offsets in message.
    emoteOffsets: string;
    // Sender's id from the platfrom
    userId: string;
    platform: "bot" | "discord" | "twitch" | "youtube";
    // Whether the user is a moderator. If platform is "discord" true if the user has the "Stream Moderator" role.
    isUserMod: boolean;
    isUserVip?: boolean;
    isUserSub?: boolean;
    // Message id of the message this message is a reply to from the platfrom.
    replyId: string | null;
    // True if its the first time this chatter messaged on the chat(only twitch).
    isFirst: boolean;
    isCommand: boolean;
    // Text shown above the message such as "Reached a 100 view streak."
    highlightMessage: string | null;
    // Color of the message's background for things such as channel point redemption.
    highlightColor: string | null;
    // Channel Id of the channel this message is from. Defined only when platform == "discord".
    channelId?: string;
    timestamp: Date;
    // Send a message in the chat this message is in, replies to the message if replyToUser is set to true.
    reply: (message: string, replyToUser: boolean) => void | Promise<void>;
    // if duration is null bans permanently. Doesn't work on Discord.
    banUser: (reason: string, duration?: number) => void | Promise<void>;
  }

  export interface Command {
    /*
     * If this command should show up on the stream chat overlay.
     */
    showOnChat: boolean;
    /*
     * The minumum amount of miliseconds between this commands executions. Moderator's bypass this timeout.
     */
    timeout?: number;
    commandFunction: (data: MessageData) => void | Promise<void>;
  }

  export type MessageListener = (data: MessageData) => void;
  export type DiscordMessageListener = (data: Message) => void;

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

  export type Listener = () => void | Promise<void>;

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
    /*
     * Adds a command, name has to be one word.
     */
    registerCommand(name: string, command: Command): void;
    onChatMessage(listener: MessageListener): void;
    onDiscordMessage(listener: DiscordMessageListener): void;

    channelPointReward(
      reward: ChannelPointReward,
    ): Promise<ChannelPointRewardStatus>;
    removeChannelPoint(rewardId: string): Promise<void>;
    setChannelPointPaused(rewardId: string, paused: boolean): Promise<void>;
    setRedemptionStatus(
      rewardId: string,
      redemptionId: string,
      status: RedemptionStatus,
    ): Promise<void>;
    setChannelPointEnabled(rewardId: string, enabled: boolean): Promise<void>;
    onChannelPointReward(
      rewardId: string,
      listener: ChannelRedemptionListener,
    ): void;
    // Runs listener when stream is online, or when the bot is started during a stream.
    onStreamOnline(listener: Listener): void;
    // Runs when the stream ends. Doesn't run when the bot is restarted not during a stream.
    onStreamOffline(listener: Listener): void;

    bot: TalkingBot;
  }
  export abstract class BotModule {
    name: string;

    init(ctx: ModuleContext): Promise<void>;
    onUnload(): void;
  }
}

declare module "botenv" {
  export const CONFIG: {
    keys: {
      steam: string;
    };
    twitch: {
      channelName: string;
    };
  };
}

declare module "botutil" {
  export function getTimeDifference(startDate: Date, endDate: Date): string;
  export function milliSecondsToString(timeDifference: number): string;

  export function replaceAsync(
    str: string,
    regex: RegExp,
    asyncFn: Function,
  ): Promise<void>;

  export function getSuffix(i: number): string;

  export function getRandomElement<T>(array: T[]): T;

  function removeByIndex(str: string, index: number): string;

  export function removeByIndexToUppercase(
    str: string,
    indexes: number[],
  ): string;
  export function hashMaptoArray<Key, Value>(
    map: Map<Key, Value>,
  ): { key: Key; value: Value }[];
  export function arraytoHashMap<Key, Value>(
    array: {
      key: Key;
      value: Value;
    }[],
  ): Map<Key, Value>;

  export function replaceMap(
    map: Map<string, string>,
    input: string,
    replacement: (match: string) => string,
  ): string;

  export function toPascalCase(input: string): string;

  export function xpToLevel(points: number): number;

  export function levelToXp(level: number): number;
}
