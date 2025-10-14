declare module "botModule" {
  export class ModuleManager {
    public getModuleStatus(module: string): boolean;

    public reloadModule(module: string): Promise<void>;

    public getModuleList(): { module: string; enabled: boolean }[];

    public enableModule(name: string): Promise<void>;

    public disableModule(name: string): Promise<void>;
  }
  export class Discord {
    public client: {};
    public guildId: string;

    public say(message: string, channelId: string): void;
  }
  export class Twitch {
    public apiClient: {};
    public channel: {};
    public chatClient: {};
    public isStreamOnline: boolean;
    public cheerEmotes: {};
    public BTTVEmotes: Map<string, string>;
    public badges: Map<string, string>;
    public getCurrentTitle(): Promise<string | null>;
    public say(message: string): Promise<void>;
  }
  export class YouTubeAPI {
    public sendMessage(message: string): Promise<void>;

    public setTitle(title: string): Promise<void>;
    public banUser(userId: string, seconds?: number): Promise<void>;
  }
  export class YouTube {
    public isConnected: boolean;
    public api: YouTubeAPI;
    public permTitle: string | null;
  }
  export class Namespace {}
  export class DB {}

  export class TalkingBot {
    /**
     * Will say message in every chat.
     */
    public broadcastMessage(message: string): Promise<void>;
    public discord: Discord;
    public twitch: Twitch;
    public youtube: YouTube;

    public iochat: Namespace;
    public iomodtext: Namespace;
    public iopoll: Namespace;
    public ioalert: Namespace;

    public database: DB;
    public moduleManager: ModuleManager;

    public modtext: string;
  }
  export interface MessageData {
    /**
     * Urls of the badges of the user.
     */
    badges: string[];
    isUserMod: boolean;
    isUserVip?: boolean;
    isUserSub?: boolean;
    message: string;
    /**
     * Message with emotes as html imgs.
     */
    parsedMessage: string;
    username: string;
    /*
     * Sender's display name
     */
    sender: string;
    senderId: string;
    color: string;
    id: string;
    platform: "bot" | "discord" | "twitch" | "youtube";
    channelId: string;
    /*
     * True if its the first time this chatter messaged on the chat(only twitch).
     */
    isFirst: boolean;
    replyTo?: string;
    replyId?: string;
    replyText?: string;
    isCommand: boolean;
    rewardName?: string;
    isOld: boolean;
    reply: (message: string, replyToUser: boolean) => void | Promise<void>;
    /*
     * if duration is null bans permanently.
     */
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
    timeout?: number; // in ms
    commandFunction: (data: MessageData) => void | Promise<void>;
  }

  export type MessageListener = (data: MessageData) => void;
  export type DiscordMessageListener = (data: any) => void;

  export interface ModuleContext {
    /*
     * Adds a command, name has to be one word.
     */
    registerCommand(name: string, command: Command): void;
    onChatMessage(listener: MessageListener): void;
    onDiscordMessage(listener: DiscordMessageListener): void;
    bot: TalkingBot;
  }
  export abstract class BotModule {
    name: string;

    init(ctx: ModuleContext): Promise<void>;
    onUnload(): void;
  }
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
}
