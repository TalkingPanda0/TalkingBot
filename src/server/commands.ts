import { TalkingBot } from "./talkingbot.ts";
import {
  arraytoHashMap,
  getTimeDifference,
  hashMaptoArray,
  levelToXp,
  milliSecondsToString,
  xpToLevel,
} from "../shared/util.ts";

import { HelixGame } from "@twurple/api";
import { Counter } from "./counter.ts";
import { exit } from "./main.ts";
import { CreditType } from "./credits.ts";

import { MessageData } from "botModule";
import { OverlayMessageData } from "../shared/types.ts";
import { WatchTimeStatus } from "./users.ts";

export interface Command {
  showOnChat?: boolean;
  timeout?: number; // in ms
  commandFunction: (data: MessageData) => void | Promise<void>;
}

export class MessageHandler {
  public counter!: Counter;
  public counterFile = Bun.file(__dirname + "/../../config/counter.json");

  private timeout = new Set();
  private bot: TalkingBot;
  private customCommandMap = new Map<string, string>();
  private commandAliasMap = new Map<string, string>();
  private argMap = new Map<string, string>();

  private argsFile = Bun.file(__dirname + "/../../config/args.json");
  private commandsFile = Bun.file(__dirname + "/../../config/commands.json");
  private aliasesFile = Bun.file(__dirname + "/../../config/aliases.json");

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.counter = new Counter(this.bot.database);
  }
  public init() {
    this.counter.init();
  }

  private commandMap: Map<string, Command> = new Map([
    [
      "!toptime",
      {
        timeout: 120 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          try {
            if (data.platform != "twitch") return;
            const isOffline = data.message === "offline";
            this.bot.userManager.updateWatchTimes(!isOffline);

            if (isOffline) {
              const times = await this.bot.database.db.query.users.findMany({
                columns: { chatTime: true, displayName: true },
                orderBy: {
                  chatTime: "desc",
                },
                limit: 3,
              });
              data.reply(
                times
                  .map(
                    (user) =>
                      `@${user.displayName} has spent ${milliSecondsToString(user.chatTime ?? 0)} in offline chat.`,
                  )
                  .join(" "),
                true,
              );
            } else {
              const times = await this.bot.database.db.query.users.findMany({
                columns: { watchTime: true, displayName: true },
                orderBy: {
                  chatTime: "desc",
                },
                limit: 3,
              });
              data.reply(
                times
                  .map(
                    (user) =>
                      `@${user.displayName} has spent ${milliSecondsToString(user.watchTime ?? 0)} watching the stream.`,
                  )
                  .join(" "),
                true,
              );
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
    ],
    [
      "!watchtime",
      {
        timeout: 60 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          if (data.platform != "twitch") return;
          const args = data.message.toLowerCase().split(" ");
          let userName = args[0];
          const isOffline = userName === "offline" || args[1] == "offline";
          let userId = data.userId;
          if (userName != null && userName.startsWith("@")) {
            const user = await this.bot.twitch.apiClient.users.getUserByName(
              userName.trim().replace("@", ""),
            );
            if (user != null) userId = user.id;
          } else {
            userName = data.displayName;
          }

          const platformId = this.bot.database.getPlatfromId("twitch");

          const watchTime = await this.bot.database.db.query.users.findFirst({
            columns: {
              lastSeen: true,
              lastSeenOnStream: true,
              watchTime: true,
              chatTime: true,
            },
            where: {
              userId,
              platform: platformId,
            },
          });

          if (!watchTime) {
            data.reply("Can't find watchtime.", true);
            return;
          }

          const status = this.bot.userManager.getWatchTimeStatus(userId);

          if (isOffline) {
            data.reply(
              `${userName} has spent ${milliSecondsToString(watchTime.chatTime ?? 0 + (status == WatchTimeStatus.Chat && watchTime.lastSeen ? new Date().getTime() - new Date(watchTime.lastSeen).getTime() : 0))} in offline chat.`,
              false,
            );
          } else {
            data.reply(
              `${userName} has spent ${milliSecondsToString(watchTime.watchTime ?? 0 + (status == WatchTimeStatus.Stream && watchTime.lastSeenOnStream ? new Date().getTime() - new Date(watchTime.lastSeenOnStream).getTime() : 0))} watching the stream.`,
              false,
            );
          }
        },
      },
    ],
    [
      "!counter",
      {
        showOnChat: false,
        commandFunction: (data) => {
          const args = data.message.toLowerCase().split(" ");
          const regex = /[+|-]/g;

          if (data.isUserMod && args[1] != null) {
            if (regex.test(args[1])) {
              this.counter.addToCounter(args[0], parseFloat(args[1]));
            } else {
              this.counter.setCounter(args[0], parseFloat(args[1]));
            }
            data.reply(
              `${args[0]} is now ${this.counter.getCounter(args[0])}.`,
              true,
            );
            this.bot.updateModText();
            this.bot.updateModTextData();

            return;
          }
          data.reply(
            `${args[0]} is at ${this.counter.getCounter(args[0])}.`,
            true,
          );
        },
      },
    ],
    [
      "!uptime",
      {
        timeout: 60 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          const stream =
            await this.bot.twitch.apiClient.streams.getStreamByUserId(
              this.bot.twitch.channel.id,
            );
          if (stream == null) {
            data.reply(
              `${this.bot.twitch.channel.displayName} is currently offline`,
              true,
            );
            return;
          }
          const timeString = getTimeDifference(stream.startDate, new Date());
          data.reply(
            `${this.bot.twitch.channel.displayName} has been live for ${timeString}`,
            true,
          );
        },
      },
    ],
    [
      "!status",
      {
        timeout: 60 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          const stream =
            await this.bot.twitch.apiClient.streams.getStreamByUserId(
              this.bot.twitch.channel.id,
            );
          if (stream == null) {
            data.reply(
              `${this.bot.twitch.channel.displayName} is currently offline`,
              true,
            );
            return;
          }
          data.reply(
            `"${stream.title}" - ${stream.gameName}: ${stream.tags}`,
            true,
          );
        },
      },
    ],
    [
      "!followage",
      {
        timeout: 60,
        showOnChat: false,
        commandFunction: async (data) => {
          if (data.platform != "twitch") return;
          const followed =
            await this.bot.twitch.apiClient.channels.getChannelFollowers(
              this.bot.twitch.channel.id,
              data.userId,
            );

          // User is not following
          if (followed.data.length == 0) {
            data.reply(
              `You are not following ${this.bot.twitch.channel.displayName}`,
              true,
            );
          } else {
            const timeString = getTimeDifference(
              followed.data[0].followDate,
              new Date(),
            );
            data.reply(
              `@${data.displayName} has been following ${this.bot.twitch.channel.displayName} for ${timeString}`,
              false,
            );
          }
        },
      },
    ],
    [
      "!editcmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          const commandName = splitMessage[0];
          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          const command = this.customCommandMap.get(commandName);
          if (!command) {
            data.reply(`Command ${commandName} does not exist!`, true);
            return;
          }
          if (splitMessage.length <= 1) {
            data.reply("No command response given", true);
            return;
          }

          this.customCommandMap.set(commandName, response);

          data.reply(`Command ${commandName} has been editted`, true);
          this.writeCustomCommands();
        },
      },
    ],
    [
      "!addarg",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          const commandName = `${splitMessage[0]} ${splitMessage[1]}`;

          if (!this.customCommandMap.has(splitMessage[0])) {
            data.reply(`Command ${commandName} does not exist!`, true);
            return;
          }
          if (splitMessage.length <= 2) {
            data.reply("No command response given", true);
            return;
          }

          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          this.argMap.set(commandName, response);

          data.reply(`argument ${commandName} has been added`, true);

          this.writeCustomCommands();
        },
      },
    ],
    [
      "!addtocmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          const commandName = splitMessage[0];
          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          if (!this.customCommandMap.has(commandName)) {
            data.reply(`Command ${commandName} does not exist!`, true);
            return;
          }
          if (splitMessage.length <= 1) {
            data.reply("No command response given", true);
            return;
          }

          this.customCommandMap.set(
            commandName,
            this.customCommandMap.get(commandName) + response,
          );

          data.reply(`Command ${commandName} has been added to`, true);
          this.writeCustomCommands();
        },
      },
    ],
    [
      "!addcmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          const commandName = splitMessage[0];
          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          if (this.customCommandMap.has(commandName)) {
            data.reply(`Command ${commandName} already exists!`, true);
            return;
          }
          if (splitMessage.length <= 1) {
            data.reply("No command response given", true);
            return;
          }

          this.customCommandMap.set(commandName, response);

          data.reply(`Command ${commandName} has been added`, true);
          this.writeCustomCommands();
        },
      },
    ],
    [
      "!showcmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const commandName = data.message.split(" ")[0];
          const command = this.customCommandMap.get(commandName);
          if (command) {
            data.reply(`${commandName}: ${command}`, true);
            return;
          } else {
            data.reply(`Command ${commandName} doesn't exist!`, true);
            return;
          }
        },
      },
    ],
    [
      "!delcmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const commandName = data.message.split(" ")[0];
          if (this.customCommandMap.delete(commandName)) {
            data.reply(`${commandName} has been removed`, true);
            this.writeCustomCommands();
          } else {
            data.reply(`${commandName} is not a command`, true);
          }
        },
      },
    ],
    [
      "!delalias",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const alias = data.message.split(" ")[0];
          if (this.commandAliasMap.delete(alias)) {
            data.reply(`${alias} has been removed`, true);
            this.writeCustomCommands();
          } else {
            data.reply(`${alias} is not an alias`, true);
          }
        },
      },
    ],
    [
      "!aliascmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const splitMessage = data.message.split(" ");
          const alias = splitMessage[0];
          const commandName = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          if (
            this.commandAliasMap.has(alias) ||
            this.customCommandMap.has(alias)
          ) {
            data.reply(`${alias} already exists`, true);
            return;
          }

          this.commandAliasMap.set(alias, commandName);

          data.reply(
            `command ${commandName} has been aliased to ${alias}`,
            true,
          );
          this.writeCustomCommands();
          return;
        },
      },
    ],
    [
      "!listcmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          const aliases = Array.from(this.commandAliasMap.keys()).join(", ");
          const custom = Array.from(this.customCommandMap.keys()).join(", ");
          const builtin = Array.from(this.commandMap.keys()).join(", ");
          data.reply(
            `Builtin Commands: ${builtin}, Custom Commands: ${custom},${aliases}`,
            true,
          );
        },
      },
    ],
    [
      "!settitle",
      {
        showOnChat: false,

        commandFunction: async (data) => {
          try {
            if (!data.isUserMod || data.message.length == 0) return;
            await this.bot.twitch.apiClient.channels.updateChannelInfo(
              this.bot.twitch.channel.id,
              { title: data.message },
            );

            await this.bot.broadcastMessage(
              `Title has been changed to "${data.message}"`,
            );
          } catch (e) {
            await this.bot.broadcastMessage("Couldn't change title");
            console.error(e);
          }
        },
      },
    ],
    [
      "!setgame",
      {
        showOnChat: false,

        commandFunction: async (data) => {
          if (!data.isUserMod || data.message.length == 0) return;
          const game: HelixGame = (
            await this.bot.twitch.apiClient.search.searchCategories(
              data.message,
              { limit: 1 },
            )
          ).data[0];

          if (game == null) {
            data.reply(`Can't find game "${data.message}"`, true);
            return;
          }
          await this.bot.twitch.apiClient.channels.updateChannelInfo(
            this.bot.twitch.channel.id,
            { gameId: game.id },
          );
          this.bot.twitch.currentGame = game.id;
          if (this.bot.twitch.isStreamOnline)
            await this.bot.discord.onGameChange(
              game.name,
              game.boxArtUrl.replace("52x72", "520x720"),
            );
          data.reply(`Game has been changed to "${game.name}"`, true);
        },
      },
    ],
    [
      "!tags",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod) return;
          const stream =
            await this.bot.twitch.apiClient.streams.getStreamByUserId(
              this.bot.twitch.channel.id,
            );
          if (stream == null) {
            data.reply("Stream is currently offline", true);
            return;
          }
          const args = data.message.toLowerCase().split(" ");

          switch (args[0]) {
            case "add": {
              const tags = stream.tags.concat(args.slice(1));
              if (tags.length >= 10) {
                data.reply("Reached maxiumum amount of tags", true);
                break;
              }
              try {
                await this.bot.twitch.apiClient.channels.updateChannelInfo(
                  this.bot.twitch.channel.id,
                  { tags },
                );
              } catch (e) {
                data.reply(e as string, true);
                return;
              }
              data.reply(`Tags ${tags} has been added`, true);
              break;
            }
            case "remove": {
              const tags = args.slice(1);
              await this.bot.twitch.apiClient.channels.updateChannelInfo(
                this.bot.twitch.channel.id,
                {
                  tags: stream.tags.filter((value) => {
                    return !tags.includes(value.toLowerCase());
                  }),
                },
              );

              data.reply(`Tags ${tags} has been removed`, true);
              break;
            }
            default:
              data.reply(`Current tags: ${stream.tags}`, true);
              return;
          }
        },
      },
    ],
    [
      "!tts",
      {
        showOnChat: true,
        commandFunction: (data): void | Promise<void> => {
          if (data.message.trim() == "") return;
          this.bot.alertsManager.sendTTS({
            type: "tts",
            text: data.message,
            sender: data.displayName,
            color: data.color,
            isImportant: false,
          });
        },
      },
    ],
    [
      "!modtts",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const args = data.message.split(" ");
          switch (args[0]) {
            case "enable":
              this.bot.alertsManager.ttsEnabled = true;
              data.reply("TTS command has been enabled", true);
              return;
            case "disable":
              this.bot.alertsManager.ttsEnabled = false;
              data.reply("TTS command has been disabled", true);
              return;
            case "skip":
              this.bot.alertsManager.skip();
              return;
            case "say":
              this.bot.alertsManager.sendTTS({
                type: "tts",
                text: data.message.split(" ").slice(1).join(" "),
                sender: data.displayName,
                color: data.color,
                isImportant: true,
              });
              return;
            default:
              data.reply(
                `TTS is currently ${this.bot.alertsManager.ttsEnabled ? "Enabled" : "Disabled"}`,
                true,
              );
              return;
          }
        },
      },
    ],
    [
      "!restart",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod) return;
          await data.reply("Restarting", true);
          await exit();
        },
      },
    ],
    [
      "!level",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          const user = await this.bot.userManager.getUser(data);
          const currentLevel = xpToLevel(user.xp);
          const currentLevelPoints = levelToXp(currentLevel);

          data.reply(
            `You are at level ${currentLevel}, you have ${user.xp - currentLevelPoints}/${levelToXp(xpToLevel(user.xp) + 1) - currentLevelPoints} xp.`,
            true,
          );
        },
      },
    ],
    [
      "!color",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          switch (data.message.trim()) {
            case "": {
              const user = await this.bot.userManager.getUser(data);
              data.reply(
                `Your color is currently set to ${user.customColor ?? user.color}.`,
                true,
              );
              break;
            }
            case "clear":
              await this.bot.userManager.setCustomColor(data, null);
              data.reply(`Your color has been cleared.`, true);
              break;
            default:
              await this.bot.userManager.setCustomColor(data, data.message);
              data.reply(`Updated your color to ${data.message}.`, true);
              break;
          }
        },
      },
    ],
    [
      "!nickname",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod) return;

          const args = data.message.split(" ");

          const username = args[0];
          const nickname = args.splice(1).join(" ");

          const user = await this.bot.userManager.findUser(
            username,
            data.platform,
          );
          if (!user) {
            data.reply(`Can't find user ${username}.`, true);
            return;
          }

          if (nickname) {
            await this.bot.userManager.setUserCustomName(user, nickname);
            data.reply(`${username} has been nicknamed to ${nickname}.`, true);
          } else {
            if (user.customName)
              data.reply(
                `${username} is nicknamed to ${user.customName}`,
                true,
              );
            else data.reply(`${username} is currently not nicknamed.`, true);
          }
        },
      },
    ],
    [
      "!unnickname",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod) return;
          const args = data.message.split(" ");
          const username = args[0];

          await this.bot.userManager.setCustomName(data, null);
          data.reply(`${username} is now not nicknamed.`, true);
        },
      },
    ],
    [
      "!commands",
      {
        showOnChat: false,
        commandFunction: (data) => {
          const commands =
            Array.from(this.commandMap.keys()).join(", ") +
            Array.from(this.customCommandMap.keys()).join(", ") +
            Array.from(this.commandAliasMap.keys()).join(", ");
          data.reply(`Commands: ${commands}`, true);
        },
      },
    ],
  ]);

  private async runCommand(
    data: MessageData,
    commandName: string | RegExpExecArray[],
    customCommand: string,
  ): Promise<boolean> {
    const message = data.message;
    const arg = this.argMap.get(`${commandName} ${data.message.split(" ")[0]}`);
    if (arg) customCommand = arg;
    const modonly = customCommand.includes("(modonly)");
    const viponly = customCommand.includes("(viponly)");
    const subonly = customCommand.includes("(subonly)");
    const canUserRunCommand =
      (!modonly || data.isUserMod) &&
      (!viponly || data.isUserVip) &&
      (!subonly || data.isUserSub);
    const doReply = customCommand.includes("(reply)");

    const response = customCommand
      .replace(/\(modonly\)/g, "")
      .replace(/\(viponly\)/g, "")
      .replace(/\(subonly\)/g, "")
      .replace(/\(reply\)/g, "")
      .replace(/\$user/g, data.displayName)
      .replace(/\$args/g, message);

    if (customCommand.includes("fetch")) {
      this.timeout.add(commandName);
      setTimeout(() => {
        this.timeout.delete(commandName);
      }, 60 * 1000);
    }
    if (typeof commandName == "string" && !canUserRunCommand)
      return commandName.startsWith("!");
    if (response.trim() != "") data.reply(response, doReply);
    return true;
  }

  // returns true if isCommand
  public async handleCommand(data: MessageData): Promise<boolean> {
    try {
      let commandName = data.message.split(" ")[0];
      let commandMessage = data.message;
      if (this.timeout.has(commandName) && !data.isUserMod) return true;
      const commandAlias = this.commandAliasMap.get(commandName);
      if (commandAlias != null) {
        commandMessage = commandMessage.replace(commandName, commandAlias);
        commandName = commandMessage.split(" ")[0];
      }
      const customCommand = this.customCommandMap.get(commandName);
      if (customCommand != null) {
        commandMessage = commandMessage.replace(commandName, "").trim();
        return await this.runCommand(data, commandName, customCommand);
      }
      const builtinCommand = this.commandMap.get(commandName);
      if (builtinCommand == null) return commandName.startsWith("!");

      commandMessage = commandMessage.replace(commandName, "").trim();
      await builtinCommand.commandFunction({...data,message: commandMessage});
      if (builtinCommand.timeout) {
        this.timeout.add(commandName);
        setTimeout(() => {
          this.timeout.delete(commandName);
        }, builtinCommand.timeout);
      }
      return !builtinCommand.showOnChat;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async sendToChatList(data: OverlayMessageData) {
    this.bot.iochat.emit("message", data);
    this.bot.chatLogger.recordMessage(data);
  }

  public async handleMessage(data: MessageData) {
    const user = await this.bot.userManager.handleMessage(data);

    data.displayName = user.customName ?? data.displayName;
    data.color = user.customColor ?? data.color;

    if (data.isUserMod)
      this.bot.credits.addToCredits({
        userId: data.userId,
        userDisplayName: data.displayName,
        color: data.color,
        type: CreditType.Moderator,
      });
    this.bot.credits.addToCredits({
      userId: data.userId,
      userDisplayName: data.displayName,
      color: data.color,
      type: CreditType.Chatter,
    });

    data.isCommand = data.isCommand || (await this.handleCommand(data));

    this.bot.moduleManager.onChatMessage(data);

    this.sendToChatList({
      displayName: data.displayName,
      userId: data.userId,
      message: data.message,
      isCommand: data.isCommand,
      badges: data.badges,
      color: data.color,
      emoteOffsets: data.emoteOffsets,
      highlightColor: data.highlightColor,
      highlightMessage: data.highlightMessage,
      isAction: data.isAction ?? false,
      isFake: false,
      messageId: data.id,
      platform: data.platform,
      replyId: data.replyId,
      timestamp: data.timestamp.getTime(),
      clip:
        data.platform == "twitch"
          ? await this.bot.twitch.parseClips(data.message)
          : undefined,
    });
  }

  public async readCustomCommands() {
    if (!(await this.commandsFile.exists())) return;

    this.customCommandMap = arraytoHashMap(await this.commandsFile.json());
    if (!(await this.aliasesFile.exists())) return;
    this.commandAliasMap = arraytoHashMap(await this.aliasesFile.json());
    if (!(await this.argsFile.exists())) return;
    this.argMap = arraytoHashMap(await this.argsFile.json());
  }

  private writeCustomCommands() {
    Bun.write(
      this.commandsFile,
      JSON.stringify(hashMaptoArray(this.customCommandMap)),
    );
    Bun.write(
      this.aliasesFile,
      JSON.stringify(hashMaptoArray(this.commandAliasMap)),
    );
    Bun.write(this.argsFile, JSON.stringify(hashMaptoArray(this.argMap)));
  }

  public getCommandAliasList(): string {
    const aliasList: { alias: string; command: string }[] = [];
    this.commandAliasMap.forEach((value, key) => {
      aliasList.push({ alias: key, command: value });
    });
    return JSON.stringify(aliasList);
  }

  public setCommandAlias(alias: string, command: string) {
    this.commandAliasMap.set(alias, command);
    this.writeCustomCommands();
  }

  public addCommandAlias(alias: string, command: string): string {
    if (this.commandAliasMap.has(alias))
      return `Alias ${alias} already exists!`;
    this.commandAliasMap.set(alias, command);
    this.writeCustomCommands();
    return "";
  }

  public deleteCommandAlias(alias: string) {
    this.commandAliasMap.delete(alias);
    this.writeCustomCommands();
  }

  public getCustomCommandList(): string {
    const commandList: { command: string; response: string }[] = [];
    this.customCommandMap.forEach((value, key) => {
      commandList.push({ command: key, response: value });
    });
    return JSON.stringify(commandList);
  }

  public getCustomCommand(name: string): string | undefined {
    return this.customCommandMap.get(name);
  }

  public setCustomCommand(name: string, response: string) {
    this.customCommandMap.set(name, response);
    this.writeCustomCommands();
  }

  public addCustomCommand(name: string, response: string): string {
    if (this.customCommandMap.has(name))
      return `Command ${name} already exists!`;
    this.customCommandMap.set(name, response);
    this.writeCustomCommands();
    return "";
  }

  public deleteCustomCommand(name: string) {
    this.customCommandMap.delete(name);
    this.writeCustomCommands();
  }

  public addCommand(name: string, command: Command): boolean {
    if (this.commandMap.has(name)) {
      console.error(`Command: ${name} already exists.`);
      return false;
    }
    this.commandMap.set(name, command);
    return true;
  }

  public removeCommand(name: string): boolean {
    return this.commandMap.delete(name);
  }
}
