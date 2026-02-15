/**
 * Command Name or Matches of Regex
 */
declare var command: string | RegExpExecArray[];
/**
 * Array of the arguments the user gave
 */
declare var args: string[];
/**
 * The username of the person who used the command
 */
declare var user: string;
/**
 * The userId of the person who used the command
 */
declare var userId: string;

declare var isUserMod: boolean;
declare var isUserSub: boolean;
declare var isUserVip: boolean;
/**
 * The platform the user used the command on
 */
declare var platform: "bot" | "discord" | "twitch" | "youtube";
/**
 * Result of the command will be said in chat after the function is over
 */
declare var result: string;

/**
 * Gets config key if it doesn't exist, creates it and sets it to default value
 */
declare function getOrSetConfig<T>(key: string, defaultvalue: T): T;
/**
 * Sets config key to value
 */
declare function setConfig(key: string, value: any): void;

declare class Users {
  /**
   * Sets the color shown in overlays of user.
   */
  setColor(id: { platform: string; username: string }, color: string): void;
  /**
   * Gets a user's nickname and color
   */
  getUser(id: { platform: string; username: string }): {
    nickname?: string;
    color?: string;
    realColor?: string;
  };
  /**
   * Sets the nickname of the user.
   */
  setNickname(
    id: { platform: string; username: string },
    username: string,
  ): void;
}

declare var users: Users;

/**
 * Will say message in chat, replies to the user if reply is true.
 */
declare function say(message: string, reply: boolean): void;
/**
 * Will ban/timeout the user with the reason and the duration.
 */
declare function banUser(reason: string, duration: number): void;
/**
 * Will say message in every chat
 */
declare function broadcast(message: string): void;
/**
 * Gets a number returns a string with that number + its ordinal suffix. for example getSuffix(12) returns "12th"
 */
declare function getSuffix(number: number): string;
/**
 * Returns a random element from an array
 */
declare function getRandomElement<T>(array: T[]): T;
/**
 * Will run command can be a custom or builtin command
 */
declare function runCommand(command: string): void;

declare function sendInDiscord(message: string, channelId: string): void;
