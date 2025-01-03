import { TalkingBot } from "./talkingbot";
import {
  getRandomElement,
  getSuffix,
  getTimeDifference,
  milliSecondsToString,
  removeByIndexToUppercase,
  replaceAsync,
} from "./util";

import { StatusReason } from "./pet";
import { HelixGame } from "@twurple/api";
import { Counter } from "./counter";
import { exit } from "./app";
import { CreditType } from "./credits";

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
  isAction?: boolean;
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
  public counter: Counter;
  public counterFile = Bun.file(__dirname + "/../config/counter.json");

  private keys: any;
  private beefage: number = 0;
  private beefageDecayTimer: Timer;
  private timeout = new Set();
  private bot: TalkingBot;
  private ttsEnabled: Boolean = false;
  private dynamicTitle: string;
  private dynamicTitleInterval: Timer;
  private lastDynamicTitle: string;
  private customCommandMap = new Map<string, string>();
  private commandAliasMap = new Map<string, string>();
  private argMap = new Map<string, string>();
  private argsFile = Bun.file(__dirname + "/../config/args.json");
  private commandsFile = Bun.file(__dirname + "/../config/commands.json");
  private aliasesFile = Bun.file(__dirname + "/../config/aliases.json");
  private keysFile = Bun.file(__dirname + "/../config/keys.json");

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.beefageDecayTimer = setInterval(
      () => {
        this.beefageDecay();
      },
      5 * 60 * 1000,
    );
  }

  public init() {
    this.counter = new Counter(this.bot.database);
  }

  private resetBeefageDecay() {
    clearInterval(this.beefageDecayTimer);
    this.beefageDecayTimer = setInterval(
      () => {
        this.beefageDecay();
      },
      5 * 60 * 1000,
    );
  }

  private beefageDecay() {
    if (this.beefage > 0) this.beefage--;
    else if (this.beefage < 0) this.beefage++;
  }

  private commandMap: Map<string, BuiltinCommand> = new Map([
    [
      "!toptime",
      {
        timeout: 120 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          try {
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
                  users.map(async (watchTime) => {
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
          this.bot.updateModText();
          setTimeout(
            () => {
              this.bot.modtext = oldModText;
              this.bot.updateModText();
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
          this.bot.modtext = `<p>${data.parsedMessage.split(" ").slice(1).join(" ")}</p>`;
          this.bot.updateModText();
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
      "!beefage",
      {
        showOnChat: false,
        commandFunction: (data) => {
          data.reply(`Current beefage: ${this.beefage}`, true);
        },
      },
    ],
    [
      "!beef",
      {
        showOnChat: false,
        timeout: 60 * 1000,
        commandFunction: (data) => {
          if (this.timeout.has("!pork") && !data.isUserMod) return;
          this.beefage++;
          data.reply(`Beefage is now: ${this.beefage}`, true);
          this.resetBeefageDecay();
        },
      },
    ],
    [
      "!pork",
      {
        showOnChat: false,
        timeout: 60 * 1000,
        commandFunction: (data) => {
          if (this.timeout.has("!beef") && !data.isUserMod) return;
          this.beefage--;
          data.reply(`Beefage is now: ${this.beefage}`, true);
          this.resetBeefageDecay();
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
      "!editcmd",
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

          let command = this.customCommandMap.get(commandName);
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
          let commandName = `${splitMessage[0]} ${splitMessage[1]}`;

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
          let commandName = splitMessage[0];
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
          let commandName = splitMessage[0];
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
          let commandName = data.message.split(" ")[0];
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
            await this.bot.youTube.api.setTitle(data.message);

            // TODO change title in kick

            this.bot.broadcastMessage(
              `Title has been changed to "${data.message}"`,
            );
          } catch (e) {
            this.bot.broadcastMessage("Couldn't change title");
            console.error(e);
          }
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
          }, 1000);
        },
      },
    ],
    [
      "!tts",
      {
        showOnChat: true,
        commandFunction: (data): void | Promise<void> => {
          if (data.message.trim() == "") return;
          this.bot.ttsManager.send({
            text: data.message,
            sender: data.sender,
            color: data.color,
            parsedText: data.parsedMessage.split(" ").slice(1).join(" "),
            isImportant: false,
          });
        },
      },
    ],
    [
      "!playtime",
      {
        timeout: 60 * 1000,
        showOnChat: false,
        commandFunction: async (data) => {
          try {
            const game = (
              await (
                await fetch(
                  `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(data.message)}`,
                )
              ).json()
            )[0];
            if (game == undefined) {
              data.reply(`Can't find game ${data.message}.`, true);
              return;
            }
            const response = await (
              await fetch(
                `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.keys.steam}&steamid=76561198800357802&format=json&include_played_free_games=true&appids_filter[0]=${game.appid}`,
              )
            ).json();
            if (response.response.game_count == 0) {
              data.reply(`SweetbabooO_o doesn't own ${game.name}.`, true);
              return;
            }
            const games: { appid: number; playtime_forever: number }[] =
              response.response.games;
            const ownedGame = games[0];

            const minutes = ownedGame.playtime_forever;
            data.reply(
              `SweetbabooO_o has ${Math.floor(minutes / 60)} hours ${minutes % 60} minutes on ${game.name}.`,
              true,
            );
          } catch (e) {
            data.reply(`Can't find game ${data.message}`, true);
            console.log(e);
          }
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
              this.bot.ttsManager.enabled = true;
              data.reply("TTS command has been enabled", true);
              return;
            case "disable":
              this.bot.ttsManager.enabled = false;
              data.reply("TTS command has been disabled", true);
              return;
            case "skip":
              this.bot.ttsManager.skip(args[1]);
              return;
            case "pause":
              this.bot.ttsManager.setPause(true);
              break;
            case "unpause":
              this.bot.ttsManager.setPause(false);
              break;
            case "say":
              this.bot.ttsManager.send({
                text: data.message.split(" ").slice(1).join(" "),
                sender: data.sender,
                color: data.color,
                parsedText: data.parsedMessage.split(" ").slice(2).join(" "),
                isImportant: true,
              });
              return;
            default:
              data.reply(
                `TTS is currently ${this.bot.ttsManager.enabled ? "Enabled" : "Disabled"}`,
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
          data.reply("Restarting", true);
          await exit();
        },
      },
    ],
    [
      "!senddiscordping",
      {
        showOnChat: false,
        commandFunction: async (data) => {
          if (!data.isUserMod) return;
          this.bot.twitch.sendStreamPing();
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
  public async handleCommand(data: MessageData): Promise<boolean> {
    try {
      let commandName = data.message.split(" ")[0];
      if (this.timeout.has(commandName) && !data.isUserMod) return true;
      const commandAlias = this.commandAliasMap.get(commandName);
      if (commandAlias != null) {
        data.message = data.message.replace(commandName, commandAlias);
        commandName = data.message.split(" ")[0];
      }
      data.message = data.message.replace(commandName, "").trim();

      let customCommand = this.customCommandMap.get(commandName);
      if (customCommand != null) {
        const message = data.message;
        const arg = this.argMap.get(
          `${commandName} ${data.message.split(" ")[0]}`,
        );
        if (arg) customCommand = arg;
        const modonly = customCommand.includes("(modonly)");
        const doReply = customCommand.includes("(reply)");
        let response = (
          await replaceAsync(
            customCommand,
            /(!?fetch)\[([^]+)\]{?(\w+)?}?/g,

            async (
              message: string,
              _command: string,
              url: string,
              key: string,
            ) => {
              url = url
                .replace(/\$user/g, data.sender)
                .replace(/\$args/g, message);
              const req = await fetch(url);
              if (key === undefined) {
                return await req.text();
              } else {
                const json = await req.json();
                return json[key];
              }
            },
          )
        )
          .replace(/suffix\((\d+)\)/g, (_message: string, number: string) => {
            return getSuffix(parseInt(number));
          })
          .replace(/\$user/g, data.sender)
          .replace(/\$args/g, message)
          .replace(/\(modonly\)/g, "")
          .replace(/\(reply\)/g, "");
        response = await replaceAsync(
          response,
          /script\((.+)\)/g,
          async (_message: string, script: string) => {
            if (modonly && !data.isUserMod) return;
            return await this.runScript(script, data);
          },
        );

        if (customCommand.includes("fetch")) {
          this.timeout.add(commandName);
          setTimeout(() => {
            this.timeout.delete(commandName);
          }, 60 * 1000);
        }
        if (modonly && !data.isUserMod) return commandName.startsWith("!");
        data.reply(response, doReply);
        return true;
      }

      const builtinCommand = this.commandMap.get(commandName);
      if (builtinCommand == null || data.platform == "discord")
        return commandName.startsWith("!");
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
    if (data.isUserMod)
      this.bot.credits.addToCredits(data.sender, CreditType.Moderator);
    this.bot.credits.addToCredits(data.sender, CreditType.Chatter);
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

        async (
          _message: string,
          _command: string,
          url: string,
          key: string,
        ) => {
          const req = await fetch(url);
          if (key === undefined) {
            return await req.text();
          } else {
            const json = await req.json();
            return json[key];
          }
        },
      )
    ).replace(/suffix\((\d+)\)/g, (_message: string, number: string) => {
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
    if (!(await this.argsFile.exists())) return;
    const arg: CommandAlias[] = await this.argsFile.json();
    arg.forEach((value) => {
      this.argMap.set(value.alias, value.command);
    });

    this.keys = await this.keysFile.json();
  }

  private writeCustomCommands() {
    const customCommands: CustomCommand[] = [];
    const commandAlias: CommandAlias[] = [];
    const args: CommandAlias[] = [];
    this.customCommandMap.forEach((value, key) => {
      customCommands.push({ command: key, response: value });
    });
    Bun.write(this.commandsFile, JSON.stringify(customCommands));
    this.commandAliasMap.forEach((value, key) => {
      commandAlias.push({ alias: key, command: value });
    });
    Bun.write(this.aliasesFile, JSON.stringify(commandAlias));
    this.argMap.forEach((value, key) => {
      args.push({ alias: key, command: value });
    });
    Bun.write(this.argsFile, JSON.stringify(args));
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

  public getCustomCommand(name: string): string {
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

  private async runScript(script: string, data: MessageData): Promise<string> {
    const context = Object.create(null);

    context.result = "";
    context.user = data.sender;
    context.args = data.message.split(" ");
    context.platform = data.platform;
    context.pet = this.bot.pet;

    context.banUser = (reason: string, duration?: number) =>
      data.banUser(reason, duration);
    context.say = (message: string, reply: boolean) =>
      data.reply(message, reply);
    context.fetch = fetch;
    context.broadcast = (message: string) => {
      this.bot.broadcastMessage(message);
    };
    context.runCommand = (command: string) => {
      data.message = command;
      data.parsedMessage = command;
      data.isCommand = true;
      this.handleCommand(data);
    };

    context.getTimeDifference = getTimeDifference;
    context.milliSecondsToString = milliSecondsToString;
    context.replaceAsync = replaceAsync;
    context.getSuffix = getSuffix;
    context.getRandomElement = getRandomElement;
    context.removeByIndexToUppercase = removeByIndexToUppercase;

    const func = new Function(
      "context",
      `
    return (async () => {
      with(context) {
        ${script}
      }
    })();
  `,
    );
    try {
      await func(context);
      return context.result;
    } catch (error) {
      console.error("Error executing custom code:", error);
      return error;
    }
  }
}
