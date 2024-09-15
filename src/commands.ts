import { TalkingBot } from "./talkingbot";
import {
  getRandomElement,
  getSuffix,
  getTimeDifference,
  milliSecondsToString,
  replaceAsync,
} from "./util";

import { kill } from "./beatsniper.js";
import { StatusReason } from "./pet";
import { HelixGame } from "@twurple/api";

export interface MessageData {
  badges: string[];
  isUserMod: boolean;
  message: string;
  parsedMessage: string;
  sender: string;
  senderId: string;
  color: string;
  id: string;
  platform: string;
  isFirst: boolean;
  replyTo: string;
  replyId: string;
  replyText: string;
  isCommand: boolean;
  rewardName: string;
  isOld: boolean;
  reply: (message: string, replyToUser: boolean) => void | Promise<void>;
  banUser: (reason: string, duration?: number) => void | Promise<void>;
}

interface CustomCommand {
  command: string;
  response: string;
}

interface CommandAlias {
  alias: string;
  command: string;
}

interface BuiltinCommand {
  showOnChat: boolean;
  timeout?: number; // in ms
  commandFunction: (data: MessageData) => void | Promise<void>;
}

export class MessageHandler {
  private keys: any;
  private timeout = new Set();
  private bot: TalkingBot;
  private counter: number = 0;
  private ttsEnabled: Boolean = false;
  private dynamicTitle: string;
  private dynamicTitleInterval: Timer;
  private lastDynamicTitle: string;
  private customCommandMap = new Map<string, string>();
  private commandAliasMap = new Map<string, string>();
  private commandsFile = Bun.file(__dirname + "/../config/commands.json");
  private aliasesFile = Bun.file(__dirname + "/../config/aliases.json");
  private keysFile = Bun.file(__dirname + "/../config/keys.json");

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  private commandMap: Map<string, BuiltinCommand> = new Map([
    [
      "!8ball",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (
            data.message.toLowerCase().includes("furry") &&
            data.message.toLowerCase().includes("sweet")
          ) {
            data.reply(
              getRandomElement(eightballMessages.slice(27, 34)),
              false,
            );
            return;
          }
          data.reply(getRandomElement(eightballMessages), false);
        },
      },
    ],
    [
      "!toptime",
      {
        timeout: 120 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          if (data.platform != "twitch") return;
          const isOffline = data.message === "offline";
          this.bot.database.updateDataBase(isOffline ? 1 : 2);
          const users = this.bot.database.getTopWatchTime(isOffline);
          const helixUsers =
            await this.bot.twitch.apiClient.users.getUsersByIds(
              users.map((watchtime) => watchtime.userId),
            );
          data.reply(
            (
              await Promise.all(
                users.map(async (watchTime, index) => {
                  const user = helixUsers.find(
                    (user) => user.id == watchTime.userId,
                  ).displayName;
                  try {
                    if (isOffline)
                      return `@${user} has spent ${milliSecondsToString(watchTime.chatTime)} in offline chat.`;
                    else
                      return `@${user} has spent ${milliSecondsToString(watchTime.watchTime)} watching the stream.`;
                  } catch (e) {
                    return e;
                  }
                }),
              )
            ).join(" "),
            false,
          );
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
          const isOffline = userName === "offline";
          let userId = data.senderId;
          if (userName != null && userName.startsWith("@")) {
            const user = await this.bot.twitch.apiClient.users.getUserByName(
              userName.trim().replace("@", ""),
            );
            if (user != null) userId = user.id;
          } else {
            userName = `${data.sender}`;
          }
          const watchTime = this.bot.database.getWatchTime(userId);

          if (watchTime == null) {
            data.reply("Can't find watchtime.", true);
            return;
          }
          if (isOffline) {
            data.reply(
              `${userName} has spent ${milliSecondsToString(watchTime.chatTime + (watchTime.inChat == 1 ? new Date().getTime() - new Date(watchTime.lastSeen).getTime() : 0))} in offline chat.`,
              false,
            );
          } else {
            data.reply(
              `${userName} has spent ${milliSecondsToString(watchTime.watchTime + (watchTime.inChat == 2 ? new Date().getTime() - new Date(watchTime.lastSeenOnStream).getTime() : 0))} watching the stream.`,
              false,
            );
          }
        },
      },
    ],
    [
      "!kill",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (data.message === "" || data.message === undefined) {
            data.reply(
              getRandomElement(selfKillMessages).replaceAll("$1", data.sender),
              false,
            );
          } else {
            data.reply(
              getRandomElement(killOtherMessages)
                .replaceAll("$1", data.sender)
                .replaceAll("$2", data.message),
              false,
            );
          }
        },
      },
    ],
    [
      "!tempsettitle",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod || data.message.length == 0) return;

          const oldTitle = await this.bot.twitch.getCurrentTitle();
          await this.bot.twitch.apiClient.channels.updateChannelInfo(
            this.bot.twitch.channel.id,
            { title: data.message },
          );
          await this.bot.youTube.api.setTitle(data.message);

          // TODO change title in kick

          this.bot.broadcastMessage(
            `Title has been changed to "${data.message}"`,
          );

          setTimeout(
            async () => {
              await this.bot.twitch.apiClient.channels.updateChannelInfo(
                this.bot.twitch.channel.id,
                { title: oldTitle },
              );
              await this.bot.youTube.api.setTitle(oldTitle);
            },
            15 * 60 * 1000,
          );
        },
      },
    ],
    [
      "!tempmodtext",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const oldModText = this.bot.modtext;
          this.bot.modtext = data.parsedMessage.split(" ").slice(1).join(" ");
          this.bot.iomodtext.emit(
            "message",
            this.bot.modtext.replaceAll("$counter", this.counter.toString()),
          );
          setTimeout(
            () => {
              this.bot.modtext = oldModText;
              this.bot.iomodtext.emit(
                "message",
                this.bot.modtext.replaceAll(
                  "$counter",
                  this.counter.toString(),
                ),
              );
            },
            15 * 60 * 1000,
          );
        },
      },
    ],

    [
      "!modtext",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          this.bot.modtext = data.parsedMessage.split(" ").slice(1).join(" ");
          this.bot.iomodtext.emit(
            "message",
            this.bot.modtext.replaceAll("$counter", this.counter.toString()),
          );
        },
      },
    ],
    [
      "!dyntitle",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          if (data.message == "stop") {
            clearInterval(this.dynamicTitleInterval);
            data.reply("Stopped dynamic title", true);
          } else {
            this.dynamicTitle = data.message;
            this.setDynamicTitle();
            this.dynamicTitleInterval = setInterval(
              this.setDynamicTitle.bind(this.bot),
              1000 * 60,
            );
            if (this.dynamicTitleInterval != null) {
              data.reply("Started dynamic title", true);
            }
          }
        },
      },
    ],
    [
      "!redeem",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          if (this.bot.twitch.redeemQueue.length == 0) {
            data.reply("No redeem found", true);
            return;
          }
          switch (data.message) {
            case "accept":
              this.bot.twitch.handleRedeemQueue(true);
              break;
            case "deny":
              this.bot.twitch.handleRedeemQueue(false);
              break;
            case "scam":
              this.bot.twitch.handleRedeemQueue(null);
              break;
            default:
              data.reply("Usage: !redeem accept/deny", true);
              break;
          }
        },
      },
    ],
    [
      "!counter",
      {
        showOnChat: false,
        commandFunction: (data) => {
          const regex = /[+|-]/g;
          if (data.isUserMod && data.message != "") {
            if (regex.test(data.message)) {
              this.counter += parseInt(data.message);
            } else {
              this.counter = parseInt(data.message);
            }
            data.reply(`The counter is now ${this.counter}.`, true);

            if (this.bot.modtext)
              this.bot.iomodtext.emit(
                "message",
                this.bot.modtext.replaceAll(
                  "$counter",
                  this.counter.toString(),
                ),
              );
            return;
          }
          data.reply(`The counter is at ${this.counter}.`, true);
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
            `\"${stream.title}\" - ${stream.gameName}: ${stream.tags}`,
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
              data.senderId,
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
              `@${data.sender} has been following ${this.bot.twitch.channel.displayName} for ${timeString}`,
              false,
            );
          }
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
          let commandName = splitMessage[0];
          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );

          if (!commandName.startsWith("!")) commandName = `!${commandName}`;
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
          let commandName = data.message.split(" ")[0];
          if (!commandName.startsWith("!")) commandName = `!${commandName}`;
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
      "!editcmd",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;
          const commandName = data.message.split(" ")[0];
          const response = data.message.substring(
            data.message.indexOf(" ") + 1,
            data.message.length,
          );
          if (this.customCommandMap.has(commandName)) {
            this.customCommandMap.set(commandName, response);
            this.writeCustomCommands();
            return;
          }
          data.reply(`${commandName} is not a command`, true);
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
          const commandName = splitMessage[1];
          const alias = splitMessage[0];
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
          const custom = Array.from(this.customCommandMap.keys()).join(", ");
          const builtin = Array.from(this.commandMap.keys()).join(", ");
          data.reply(
            `Builtin Commands: ${builtin}, Custom Commands: ${custom}`,
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
          if (!data.isUserMod || data.message.length == 0) return;
          await this.bot.twitch.apiClient.channels.updateChannelInfo(
            this.bot.twitch.channel.id,
            { title: data.message },
          );
          await this.bot.youTube.api.setTitle(data.message);

          // TODO change title in kick

          this.bot.broadcastMessage(
            `Title has been changed to "${data.message}"`,
          );
        },
      },
    ],
    [
      "!permtitle",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod || data.message.length == 0) return;

          await this.bot.twitch.apiClient.channels.updateChannelInfo(
            this.bot.twitch.channel.id,
            { title: data.message },
          );
          this.bot.broadcastMessage(
            `Title has been changed to "${data.message}"`,
          );
          await this.bot.youTube.api.setTitle(data.message);
          const streamInfo =
            await this.bot.twitch.apiClient.streams.getStreamByUserId(
              this.bot.twitch.channel.id,
            );
          if (streamInfo != null)
            this.bot.youTube.permTitle = `${data.message} (${streamInfo.gameName})`;

          // TODO change title in kick
        },
      },
    ],
    [
      "!setgame",
      {
        showOnChat: false,

        commandFunction: async (data) => {
          if (!data.isUserMod || data.message.length == 0) return;
          const game: HelixGame =
            await this.bot.twitch.apiClient.games.getGameByName(data.message);
          if (game == null) {
            data.reply(`Can't find game "${data.message}"`, true);
            return;
          }
          await this.bot.twitch.apiClient.channels.updateChannelInfo(
            this.bot.twitch.channel.id,
            { gameId: game.id },
          );
          // TODO change game in yt

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
            case "add":
              const newTags = stream.tags.concat(args.slice(1));
              if (newTags.length >= 10) {
                data.reply("Reached maxiumum amount of tags", true);
                break;
              }
              try {
                await this.bot.twitch.apiClient.channels.updateChannelInfo(
                  this.bot.twitch.channel.id,
                  { tags: newTags },
                );
              } catch (e) {
                data.reply(e, true);
                return;
              }
              data.reply(`Tags ${newTags} has been added`, true);
              break;
            case "remove":
              const tagsToRemove = args.slice(1);
              await this.bot.twitch.apiClient.channels.updateChannelInfo(
                this.bot.twitch.channel.id,
                {
                  tags: stream.tags.filter((value) => {
                    return !tagsToRemove.includes(value.toLowerCase());
                  }),
                },
              );

              data.reply(`Tags ${tagsToRemove} has been removed`, true);
              break;
            default:
              data.reply(`Current tags: ${stream.tags}`, true);
              return;
          }
        },
      },
    ],
    [
      "!bsr",
      {
        showOnChat: false,
        commandFunction: (data): void | Promise<void> => {
          if (data.platform == "twitch") return;
          this.bot.twitch.say(`!bsr ${data.message}`);
          setTimeout(() => {
            this.bot.twitch.say(
              `!songmsg ${data.message} Requested by @${data.sender}`,
            );
          }, 500);
        },
      },
    ],
    [
      "!tts",
      {
        showOnChat: true,
        commandFunction: (data): void | Promise<void> => {
          if (data.message.trim() == "") return;
          if (!data.isUserMod && !this.ttsEnabled) return;

          this.bot.iotts.emit("message", {
            text: data.message,
            sender: data.sender,
            color: data.color,
            parsedText: data.parsedMessage.split(" ").slice(1).join(" "),
          });
        },
      },
    ],
    [
      "!snipe",
      {
        showOnChat: false,
        timeout: 60 * 1000,
        commandFunction: async (data) => {
          if (!data.isUserMod) return;
          data.reply(`Sniping ${data.message}`, true);
          const songs = await kill(data.message);
          if (songs.length === 0) {
            data.reply("Couldn't find songs", true);
          }
          songs.forEach((map) => {
            data.reply(`!bsr ${map}`, false);
          });
        },
      },
    ],
    [
      "!bs",
      {
        timeout: 60 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          const response = await (
            await fetch(
              `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.keys.steam}&steamid=76561198800357802&format=json`,
            )
          ).json();
          const games: { appid: number; playtime_forever: number }[] =
            response.response.games;
          const minutes = games.find((game) => {
            return game.appid == 620980;
          }).playtime_forever;
          data.reply(
            `SweetBabooO_o has ${Math.floor(minutes / 60)} hours ${minutes % 60} minutes on Beat Saber.`,
            true,
          );
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
              this.ttsEnabled = true;
              data.reply("TTS command has been enabled", true);
              return;
            case "disable":
              this.ttsEnabled = false;
              data.reply("TTS command has been disabled", true);
              return;
            case "skip":
              this.bot.iotts.emit("skip", args[1]);
              return;
          }
        },
      },
    ],
    [
      "!hapboo",
      {
        showOnChat: false,
        commandFunction: (data) => {
          if (!data.isUserMod) return;

          this.bot.iomodtext.emit(
            "message",
            '<img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6"><img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3c2386e9c7064294811122aff92173c6/default/dark/3.0" class="emote" id="emotesv2_3c2386e9c7064294811122aff92173c6">',
          );
        },
      },
    ],

    [
      "!wheel",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod) {
            data.reply(this.bot.wheel.toString(false), true);
            return;
          }
          const args = data.message.split(" ");
          switch (args[0]) {
            case "chat":
              if (args[1] == null) break;
              data.reply("WHEEEEEEEEEEEL SPINING!!!!", false);
              setTimeout(() => {
                const result = this.bot.wheel.spinInChat();
                data.reply(`${args[1]} won ${result}!!!`, false);
              }, 5000);
              break;
            case "spin":
              this.bot.wheel.spinWheel();
              data.reply("WHEEEEEEEEEEEL SPINING!!!!", false);
              break;
            case "add":
              let weight = parseInt(args.at(-1));
              let color: string;
              let text: string;

              if (isNaN(weight)) {
                weight = parseInt(args.at(-2));
                color = args.at(-1);
                text = args.slice(1, -2).join(" ");
              } else {
                text = args.slice(1, -1).join(" ");
              }
              if (text == null || isNaN(weight)) {
                return;
              }
              this.bot.wheel.addSegment(text, weight, color);
              data.reply(`Added segment ${text}`, true);
              break;
            case "remove":
              const segment = args.splice(1).join(" ");
              if (segment == null) return;
              if (this.bot.wheel.removeSegment(segment)) {
                data.reply(`Removed segment ${segment}`, true);
              }
              break;
            case "update":
              this.bot.wheel.updateWheel();
              break;
            case "read":
              this.bot.wheel.readWheel();
              break;
            case "weights":
              data.reply(this.bot.wheel.toString(true), true);
              break;
            default:
              data.reply(this.bot.wheel.toString(false), true);
              break;
          }
        },
      },
    ],
    [
      "!testwheel",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod) return;
          let results = new Map<string, number>();
          for (var i = 0; i < 100000000; i++) {
            const result = this.bot.wheel.spinInChat();
            const savedResult = results.get(result);
            if (savedResult) results.set(result, savedResult + 1);
            else results.set(result, 1);
          }
          const sum = Array.from(results.values()).reduce(
            (pv, cv) => (pv += cv),
          );
          results.forEach((value, key) => {
            console.log(`${key}: ${value * (100 / sum)}`);
          });
        },
      },
    ],
    [
      "!pet",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (data.platform == "kick") return;
          const args = data.message.split(" ");
          switch (args[0]) {
            case "feed":
              if (this.bot.pet.feed(data.sender)) {
                data.banUser("Hapboo Shield", 10 * 60);
              }
              break;
            case "status":
              data.reply(this.bot.pet.sayStatus(StatusReason.command), true);
              break;
            case "graveyard":
              data.reply(this.bot.pet.graveyard(args[1]), true);
              break;
            case "fuel":
              if (this.bot.pet.fuel(data.sender)) {
                data.banUser("Hapboo Shield", 10 * 60);
              }
              break;
            case "pet":
              data.reply(this.bot.pet.pet(data.sender), true);
              break;
            case "murderers":
              data.reply(this.bot.pet.murdererList(), true);
              break;
            case "start":
              if (data.isUserMod) {
                this.bot.pet.init(true);
                break;
              }
            case "sleep":
              if (data.isUserMod) {
                this.bot.pet.sleep();
                break;
              }
            case "continue":
              if (data.isUserMod) {
                this.bot.pet.init(false);
                break;
              }
            case "tick":
              if (data.isUserMod) {
                this.bot.pet.tick();
                break;
              }
            case "read":
              if (data.isUserMod) {
                this.bot.pet.readPet();
                break;
              }
            case "write":
              if (data.isUserMod) {
                this.bot.pet.writePet();
                break;
              }
            case "protect":
              if (data.isUserMod) {
                this.bot.pet.activateShield();
                break;
              }
            default:
              if (args[0].startsWith("f")) {
                if (this.bot.pet.feedOrFuel(data.sender))
                  data.banUser("Hapboo Shield", 10 * 60);
                return;
              }
              data.reply(
                "Usage !pet feed|fuel|status|pet|graveyard|murderers. Use !petinfo for more info.",
                true,
              );
          }
        },
      },
    ],
  ]);
  // returns true if isCommand
  private async handleCommand(data: MessageData): Promise<boolean> {
    try {
      if (!data.message.startsWith("!")) return false;
      let commandName = data.message.split(" ")[0];
      if (this.timeout.has(commandName)) return true;
      data.message = data.message.replace(commandName, "").trim();
      const commandAlias = this.commandAliasMap.get(commandName);
      if (commandAlias != null) commandName = commandAlias;

      const customCommand = this.customCommandMap.get(commandName);
      if (customCommand != null) {
        const message = data.message;
        const modonly = customCommand.includes("(modonly)");
        const doReply = customCommand.includes("(reply)");
        let response = (
          await replaceAsync(
            customCommand,
            /(!?fetch)\[([^]+)\]{?(\w+)?}?/g,

            async (
              message: string,
              command: string,
              url: string,
              key: string,
            ) => {
              url = url
                .replace(/\$user/g, data.sender)
                .replace(/\$args/g, message);
              const req = await fetch(url);
              if (command.startsWith("!")) return "";
              if (key === undefined) {
                return await req.text();
              } else {
                const json = await req.json();
                return json[key];
              }
            },
          )
        )
          .replace(/suffix\((\d+)\)/g, (message: string, number: string) => {
            return getSuffix(parseInt(number));
          })
          .replace(/\$user/g, data.sender)
          .replace(/\$args/g, message)
          .replace(/\(modonly\)/g, "")
          .replace(/\(reply\)/g, "");

        if (customCommand.includes("fetch")) {
          this.timeout.add(commandName);
          setTimeout(() => {
            this.timeout.delete(commandName);
          }, 60 * 1000);
        }
        if (modonly && !data.isUserMod) return true;
        data.reply(response, doReply);
        return true;
      }

      const builtinCommand = this.commandMap.get(commandName);
      if (builtinCommand == null) return true;
      builtinCommand.commandFunction(data);
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

  private sendToChatList(data: MessageData) {
    this.bot.iochat.emit("message", data);
  }

  public async handleMessage(data: MessageData) {
    data.isCommand = data.isCommand || (await this.handleCommand(data));

    data.id = `${data.platform}-${data.id}`;
    data.senderId = `${data.platform}-${data.senderId}`;
    data.replyId = `${data.platform}-${data.replyId}`;

    this.sendToChatList(data);
  }

  private async setDynamicTitle() {
    if (this.dynamicTitle == null) return;
    const title = (
      await replaceAsync(
        this.dynamicTitle,
        /(!?fetch)\[([^]+)\]{?(\w+)?}?/g,

        async (message: string, command: string, url: string, key: string) => {
          const req = await fetch(url);
          if (key === undefined) {
            return await req.text();
          } else {
            const json = await req.json();
            return json[key];
          }
        },
      )
    ).replace(/suffix\((\d+)\)/g, (message: string, number: string) => {
      return getSuffix(parseInt(number));
    });
    if (title != this.lastDynamicTitle) {
      this.bot.twitch.chatClient.say(
        this.bot.twitch.channel.name,
        `Title has been set to ${title}`,
      );
      this.bot.twitch.apiClient.channels.updateChannelInfo(
        this.bot.twitch.channel.id,
        {
          title: title,
        },
      );
      this.bot.youTube.api.setTitle(title);
      this.lastDynamicTitle = title;
    }
  }
  public async readCustomCommands() {
    if (!(await this.commandsFile.exists())) return;
    const customCommands: CustomCommand[] = await this.commandsFile.json();
    customCommands.forEach((value) => {
      this.customCommandMap.set(value.command, value.response);
    });
    if (!(await this.aliasesFile.exists())) return;
    const commandAlias: CommandAlias[] = await this.aliasesFile.json();
    commandAlias.forEach((value) => {
      this.commandAliasMap.set(value.alias, value.command);
    });
    this.keys = await this.keysFile.json();
  }

  private writeCustomCommands() {
    const customCommands: CustomCommand[] = [];
    const commandAlias: CommandAlias[] = [];
    this.customCommandMap.forEach((value, key) => {
      customCommands.push({ command: key, response: value });
    });
    Bun.write(this.commandsFile, JSON.stringify(customCommands));
    this.commandAliasMap.forEach((value, key) => {
      commandAlias.push({ alias: key, command: value });
    });
    Bun.write(this.aliasesFile, JSON.stringify(commandAlias));
  }
}

const selfKillMessages: string[] = [
  "$1 managed to kill themself.",
  "$1 died from an unknown cause.",
  "$1 was crushed by a boulder, or some piece of debris.",
  "$1 exploded.",
  "$1 forgot how to breathe.",
  "$1 learned that cellular respiration uses oxygen, not sand.",
  "$1 died.",
  "$1 tried to befriend a wild grizzly bear.",
  "$1 suffocated.",
  "$1 tested the bounds of time and space, and lost.",
  "$1 imploded.",
  "$1 drowned.",
  "$1 ceased to be.",
  "$1 went kablewy!",
  "$1 figured out how to divide by 0!",
  "$1 took a long walk off a short pier.",
  "$1 fell off a ladder.",
  "$1 fell off a tree.",
  "$1 fell off of the roof.",
  "$1 burst into flames.",
  "$1 was struck by lightning.",
  "$1 starved to death.",
  "$1 was stabbed to death.",
  "$1 fell victim to gravity.",
  "$1's plead for death was answered.",
  "$1's vital organs were ruptured.",
  "$1's innards were made outwards.",
  "$1 was licked to death. Don't ask.",
  "$1 was deleted.",
  "$1 had to split. Literally..",
  "$1 has bled to death.",
  "$1 Food is a gift from God. Spices are a gift from the devil. I guess it was a little too spicy for you.",
  "$1 has died due to a vehicular explosion!",
  "$1 has killed themself!",
  "$1 has been blown up by a landmine!",
  "$1 died due to holding their breath for too long!",
  "$1 burned to death.",
  "$1 was blown up by a missile!",
  "$1 froze to death.",
  "$1 was dissolved in acid.",
  "$1 tried to swim in acid.",
  "$1 tried to swim in lava.",
  "$1 experienced kinetic energy.",
  "$1 blew up.",
  "$1 fell into a patch of fire.",
  "$1 fell out of a plane.",
  "$1 went up in flames.",
  "$1 withered away.",
  "$1 went skydiving, and forgot the parachute.",
  "$1 spontaneously combusted.",
  "$1 was struck with a bolt of inspiration, I mean lightning.",
  "$1 ended it all. Goodbye cruel world!",
  "$1 passed the event horizon.",
];

const killOtherMessages: string[] = [
  "$1 murdered $2 with a unicorn's horn!",
  "$2 was killed by $1!",
  "$2 was mauled by $1 dressed up as a chicken.",
  "$2 was ripped apart by $1, daaaaaaamn!",
  "$2 was brutally murdered by $1 with a car!",
  "$1 covered $2 in meat sauce and threw them in a cage with a starved tiger.",
  "$1 genetically modified a Venus flytrap to grow abnormally large, and trapped $2 in a room with it.",
  "$1 shanked $2's butt, over and over again.",
  "$1 just wrote $2's name in their Death Note.",
  "$1 put $2 out of their misery.",
  "$1 destroyed $2!",
  "$1 atacó a $2 con un consolador grande!",
  "$2 was poked a bit too hard by $1 with a spork!",
  "ZA WARUDO! $1 stopped time and throw hundreds of knives at $2. END!",
  "$1 attacked $2 with a rusty spork...and managed to kill $2 with very little effort.",
  "$1 stole a car known as 'KITT' and ran over $2.",
  "$1 tickled $2 to death!",
  "$2's skull was crushed by $1!",
  "$2 is in several pieces after a tragic accident involving $1 and cutlery.",
  "$1 licked $2 until $2 was squishy, yeah.. squishy.",
  "$1 catapulted a huge load of rusty sporks on to $2. $2 died.",
  "$1 ran out of rusty sporks and unicorn horns to kill $2 with, so instead they used a rusty hanger.",
  "$1 came in like a mystical being of awesomeness and destroyed $2!",
  "$2 drowned whilst trying to escape from $1",
  "$2 walked into a cactus while running from $1",
  "$2 was attacked by $1 behind a Taco Bell.",
  "$1 went back in time to prevent himself from killing $2, apparently the time machine landed on $2 when $1 jumped back in time.",
  "$1 rekt $2 30-4 by doing a 360 no-scope.",
  "$1 struck the final blow and ended $2.",
  "$1 tried to kill $2 with a unicorn's horn, but police showed up before $1 had time.",
  "$1 tried to murder $2, but swat was hiding in the bushes and jumped on $1 before it could be done.",
  "$1 was going to hit $2 with a hammer. However $2 was trained in the Secret Nippon Arts!",
  "$1 attacked $2 with a plastic spoon, but then suddenly a swarm of police surrounded $1 and detained them.",
  "$2 is protected by an unknown force which repels $1.",
  "$1 was justly ended by $2.",
  "$1 was blown up by $2.",
  "$1 was shot off a ladder by $2.",
  "$1 tried to swim in lava while trying to escape $2.",
  "$1 got finished off by $2.",
  "$1 delivered the fatal blow on $2.",
  "$1 has punched $2 to death.",
  "$1 ruffled $2's fluff, and died!",
  "$1 hugged $2 a little too tight.",
  "$1 sent $2 to an awesome farm in the country.",
];

export const eightballMessages: string[] = [
  "Reply hazy try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Go for it!",
  "You will have to wait.",
  "Ask again later.",
  "Concentrate and ask again.",
  "Never going to happen!",
  "The odds of that happening are pretty slim.",
  "My reply is no.",
  "My sources say no.",
  "Very doubtful.",
  "No.",
  "I have no response for that question...",
  "Why would I tell you?",
  "Forget about it.",
  "Don't bet on it.",
  "Who knows?",
  "Without a doubt.",
  "You may rely on it.",
  "Outlook good.",
  "Probably.",
  "Most likely.",
  "This is not the Bot you're looking for ༼ﾉ۞⌂۞༽ﾉ",
  "There's a pretty good chance.",
  "No, don't even think about.",
  "Yes, in due time.",
  "It is certain.",
  "Signs point to yes.",
  "Yes definitely.",
  "As I see it, yes.",
  "Yes.",
  "Signs point to yes.",
];
