import { ChatMessage } from "@twurple/chat";
import { Twitch } from "./twitch";
import { Kick } from "./kick";
import { HelixGame } from "@twurple/api";
import {
  Star,
  findClosestStar,
  metersToSolarRadii,
  solarRadiiToMeter,
} from "./stars";
import fs, { existsSync } from "node:fs";

import { Server } from "socket.io";
import * as http from "http";
const kickEmotePrefix = /sweetbabooo-o/g;

export enum Platform {
  twitch,
  kick,
}
export interface Command {
  command: string;
  showOnChat: boolean;
  commandFunction: (
    user: string,
    isUserMod: boolean,
    message: string,
    reply: (message: string, replyToUser: boolean) => void | Promise<void>,
    platform: Platform,
    context?: ChatMessage,
  ) => void | Promise<void>;
}
export interface CustomCommand {
  command: string;
  response: string;
}

export interface TTSMessage {
  text: string;
  sender: string;
}
export interface AuthSetup {
  twitchClientId: string;
  twitchClientSecret: string;
  channelName: string;
  playerdatapath: string;
}
export interface ChatMsg {
  text: string;
  sender: string;
  badges: string[];
  color: string;
  id: string;
  platform: string;
}
export interface pollOption {
  id: string;
  label: string;
  votes: number;
}
export interface Poll {
  title: string;
  options: pollOption[];
}
interface TimeDifference {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
}

function getTimeDifference(startDate: Date, endDate: Date): TimeDifference {
  const timeDifference = endDate.getTime() - startDate.getTime();
  const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365.25));
  const remainingTime = timeDifference % (1000 * 60 * 60 * 24 * 365.25);
  const months = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30.44));
  const remainingTime2 = remainingTime % (1000 * 60 * 60 * 24 * 30.44);
  const days = Math.floor(remainingTime2 / (1000 * 60 * 60 * 24));
  const remainingTime3 = remainingTime2 % (1000 * 60 * 60 * 24);
  const hours = Math.floor(remainingTime3 / (1000 * 60 * 60));
  const remainingTime4 = remainingTime3 % (1000 * 60 * 60);
  const minutes = Math.floor(remainingTime4 / (1000 * 60));

  return {
    years,
    months,
    days,
    hours,
    minutes,
  };
}
function removeByIndex(str: string, index: number): string {
  return str.slice(0, index) + str.slice(index + 1);
}
export async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: Function,
) {
  const promises = [];
  str.replace(regex, (full, ...args) => {
    promises.push(asyncFn(full, ...args));
    return full;
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}
function removeByIndexToUppercase(str: string, indexes: number[]): string {
  let deletedChars = 0;
  indexes.forEach((index) => {
    let i = index - deletedChars;
    while (
      !isNaN(parseInt(str.charAt(i), 10)) ||
      str.charAt(i) !== str.charAt(i).toUpperCase()
    ) {
      str = removeByIndex(str, i);
      deletedChars++;
    }
  });
  return str;
}

function parseCustomCommand(command: CustomCommand): Command {
  return {
    showOnChat: false,
    command: command.command,
    commandFunction: async (
      user: string,
      isUserMod: boolean,
      message: string,
      reply: Function,
      platform: Platform,
      context?: ChatMessage,
    ) => {
      const modonly = command.response.includes("(modonly)");
      const doReply = command.response.includes("(reply)");
      let response = command.response
        .replace(/\$user/g, user)
        .replace(/\$args/g, message)
        .replace(/\(modonly\)/g, "")
        .replace(/\(reply\)/g, "");

      response = await replaceAsync(
        response,
        /(!?fetch)\[([^]+)\]/g,
        async (message: string, command: string, url: string) => {
          const req = await fetch(url);
          const text = await req.text();
          if (command.startsWith("!")) return "";

          return text;
        },
      );

      if (modonly && !isUserMod) return;
      reply(response, doReply);
    },
  };
}
function removeKickEmotes(message: string): string {
  const regex = /\[emote:(\d+):([^\]]+)\]/g;
  return message
    .replace(regex, (match, id, name) => {
      console.log(match);
      console.log(id);
      return name;
    })
    .replace(kickEmotePrefix, "");
}

export class TalkingBot {
  public twitch: Twitch;
  public kick: Kick;
  public iochat: Server;
  public iopoll: Server;
  public ioalert: Server;
  public commandList: Command[] = [];
  public customCommands: CustomCommand[] = [];

  private kickId: string;
  private server: http.Server;
  private iotts: Server;
  private ttsEnabled: Boolean = true;
  private readCustomCommands(): void {
    if (!existsSync("./commands.json")) return;
    this.customCommands = JSON.parse(
      fs.readFileSync("./commands.json", "utf-8"),
    );
  }
  private writeCustomCommands(): void {
    fs.writeFileSync(
      "./commands.json",
      JSON.stringify(this.customCommands),
      "utf-8",
    );
  }

  constructor(kickId: string, server: http.Server) {
    this.server = server;

    this.iotts = new Server(this.server, {
      path: "/tts/",
    });

    this.iochat = new Server(this.server, {
      path: "/chat/",
    });
    this.iopoll = new Server(this.server, {
      path: "/poll/",
    });
    this.ioalert = new Server(this.server, {
      path: "/alerts/",
    });
    this.kickId = kickId;

    this.readCustomCommands();
    this.commandList = [
      /*{
        showOnChat: false,
        command: "!followage",
        commandFunction: async (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          if (platform == Platform.kick) return;
          const followed =
            await this.twitch.apiClient.channels.getChannelFollowers(
              this.twitch.channel.id,
              context.userInfo.userId,
            );

          // User is not following
          if (followed.data.length == 0) {
            console.log("a");
            reply(
              `You are not following ${this.twitch.channel.displayName}`,
              true,
            );
          } else {
            const time = getTimeDifference(
              followed.data[0].followDate,
              new Date(),
            );
            let timeString = "";
            if (time.years != 0) timeString += `${time.years} years`;
            if (time.months != 0) timeString += `${time.months} months`;
            if (time.days != 0) timeString += `${time.days} days`;
            if (time.minutes != 0) timeString += `${time.minutes} minutes`;

            reply(
              `@${user} has been following ${this.twitch.channel.displayName} for ${timeString}`,
              false,
            );
          }
        },
      },*/
      {
        showOnChat: false,
        command: "!addcmd",
        commandFunction: (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          if (!isUserMod) return;
          const splitMessage = message.split(" ");
          let commandName = splitMessage[0];
          const response = message.substring(
            message.indexOf(" ") + 1,
            message.length,
          );

          if (!commandName.startsWith("!")) commandName = `!${commandName}`;
          const customCom: CustomCommand = {
            command: commandName,
            response: response,
          };
          if (
            this.customCommands.some(
              (element) => element.command == commandName,
            )
          ) {
            reply(`Command ${commandName} already exists!`, true);
            return;
          }
          if (splitMessage.length <= 1) {
            reply("No command response given", true);
            return;
          }

          this.customCommands.push(customCom);

          reply(`Command ${commandName} has been added`, true);
          this.writeCustomCommands();
        },
      },
      {
        showOnChat: false,
        command: "!delcmd",
        commandFunction: (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          if (!isUserMod) return;
          const oldLen = this.customCommands.length;
          const commandName = message.split(" ")[0];
          this.customCommands = this.customCommands.filter(
            (element) => element.command != commandName,
          );
          if (oldLen != this.customCommands.length) {
            reply(`${commandName} has been removed`, true);
            this.writeCustomCommands();
          } else {
            reply(`${commandName} is not a command`, true);
          }
        },
      },
      {
        showOnChat: false,
        command: "!editcmd",
        commandFunction: (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          if (!isUserMod) return;
          const commandName = message.split(" ")[0];
          const response = message.substring(
            message.indexOf(" ") + 1,
            message.length,
          );

          for (let i = 0; i < this.customCommands.length; i++) {
            const command = this.customCommands[i];
            if (command.command == commandName) {
              command.response = response;
              reply(`command ${commandName} has been edited`, true);
              this.writeCustomCommands();
              return;
            }
          }
          reply(`${commandName} is not a command`, true);
        },
      },
      {
        showOnChat: false,
        command: "!aliascmd",
        commandFunction: (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          if (!isUserMod) return;
          const splitMessage = message.split(" ");
          const commandName = splitMessage[1];
          const newCommand = splitMessage[0];
          if (
            this.customCommands.some((element) => element.command == newCommand)
          ) {
            reply(`${newCommand} already exists`, true);
            return;
          }

          for (let i = 0; i < this.customCommands.length; i++) {
            const command = this.customCommands[i];
            if (command.command == commandName) {
              this.customCommands.push({
                command: newCommand,
                response: command.response,
              });
              reply(
                `command ${newCommand} has been aliased to ${command.command}`,
                true,
              );

              this.writeCustomCommands();
              return;
            }
          }
          reply(`${commandName} is not a command`, true);
        },
      },
      {
        showOnChat: false,
        command: "!lurk",
        commandFunction: (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          reply(
            `@${user} is now lurking at the bottom of the fish tank`,
            false,
          );
        },
      },
      {
        showOnChat: false,
        command: "!distance",
        commandFunction: (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          const playerData = JSON.parse(
            fs.readFileSync(this.twitch.dataPath, "utf-8"),
          );

          const distance =
            playerData.localPlayers[0].playerAllOverallStatsData
              .soloFreePlayOverallStatsData.handDistanceTravelled;
          const distanceinkm = Math.round(distance / 10) / 100;
          const distanceinSolar = metersToSolarRadii(distance);
          const star: Star = findClosestStar(metersToSolarRadii(distance));
          const diameter = solarRadiiToMeter(star.radius * 2);
          const diameterinkm = Math.round(diameter / 10) / 100;
          const percent =
            Math.round((distanceinkm / diameterinkm) * 10000) / 100;
          console.log(
            `${distance},${distanceinkm},${distanceinSolar},${star},${diameter},${diameterinkm},${percent}`,
          );
          reply(
            `${star.name}: ${distanceinkm}/${diameterinkm} km (${percent}%) `,
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!fsog",
        async commandFunction(
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) {
          try {
            let response = await fetch("https://talkingpanda.dev/fsog");
            reply(
              `SweetbabooO_o currently has ${await response.text()} on furry shades of gay`,
              true,
            );
          } catch {
            reply("Failed getting data", true);
          }
        },
      },
      {
        showOnChat: false,
        command: "!settitle",

        commandFunction: async (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          if (!isUserMod || message.length == 0) return;
          await this.twitch.apiClient.channels.updateChannelInfo(
            this.twitch.channel.id,
            { title: message },
          );
          // TODO change title in kick

          reply(`Title has been changed to "${message}"`, true);
        },
      },
      {
        showOnChat: false,
        command: "!setgame",

        commandFunction: async (
          user,
          isUserMod,
          message,
          reply,
          platform,
          context,
        ) => {
          if (!isUserMod || message.length == 0) return;
          const game: HelixGame =
            await this.twitch.apiClient.games.getGameByName(message);
          if (game == null) {
            reply(`Can't find game "${message}"`, true);
            return;
          }
          await this.twitch.apiClient.channels.updateChannelInfo(
            this.twitch.channel.id,
            { gameId: game.id },
          );
          // TODO change game in kick

          reply(`Game has been changed to "${game.name}"`, true);
        },
      },
      {
        showOnChat: false,
        command: "!adopt",

        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(`${message} has been adopted by @${user}!`, true);
        },
      },
      {
        showOnChat: false,
        command: "!socials",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(
            "SweetbabooO_o's socials: https://linktr.ee/SweetbabooO_o",
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!yt",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(
            "SweetbabooO_o's Youtube channel: https://www.youtube.com/channel/UC1dRtHovRsOwq2qSComV_OQ",
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!twitch",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(
            "SweetbabooO_o's Twitch channel: https://www.twitch.tv/sweetbabooo_o",
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!kick",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(
            "SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o/",
            true,
          );
        },
      },
      {
        showOnChat: false,
        command: "!bsr",
        commandFunction: (
          user: string,
          isUserMod: boolean,
          message: string,
          reply: Function,
          platform: Platform,
          context?: ChatMessage,
        ): void | Promise<void> => {
          if (platform == Platform.twitch) return;
          this.twitch.chatClient.say(
            this.twitch.channel.name,
            `!bsr ${message}`,
          );
        },
      },
      {
        showOnChat: true,
        command: "!tts",
        commandFunction: (
          user: string,
          isUserMod: boolean,
          message: string,
          reply: Function,
          platform: Platform,
          context?: ChatMessage,
        ): void | Promise<void> => {
          if (platform == Platform.twitch && context != null) {
            let msg = message.trim();

            var indexes: number[] = [];
            context.emoteOffsets.forEach((emote) => {
              emote.forEach((index) => {
                indexes.push(parseInt(index) - "!tts ".length);
              });
            });
            msg = removeByIndexToUppercase(msg, indexes);
            let ttsMessage: TTSMessage = {
              text: msg,
              sender: user,
            };

            this.sendTTS(ttsMessage, false);
          } else if (platform == Platform.kick) {
            const ttsMessage = {
              text: removeKickEmotes(message),
              sender: user,
            };
            this.sendTTS(ttsMessage, false);
          }
        },
      },
      {
        showOnChat: true,
        command: "!modtts",
        commandFunction: (
          user: string,
          isUserMod: boolean,
          message: string,
          reply: Function,
          platform: Platform,
          context?: ChatMessage,
        ): void | Promise<void> => {
          if (!isUserMod) return;
          if (platform == Platform.twitch && context != null) {
            let msg = message.trim();

            var indexes: number[] = [];
            context.emoteOffsets.forEach((emote) => {
              emote.forEach((index) => {
                indexes.push(parseInt(index) - "!modtts ".length);
              });
            });
            msg = removeByIndexToUppercase(msg, indexes);
            let ttsMessage: TTSMessage = {
              text: msg,
              sender: user,
            };

            this.sendTTS(ttsMessage, true);
          } else if (platform == Platform.kick) {
            const ttsMessage = {
              text: removeKickEmotes(message),
              sender: user,
            };
            this.sendTTS(ttsMessage, true);
          }
        },
      },
    ];

    this.twitch = new Twitch(this);
    this.kick = new Kick(this.kickId, this);
  }
  public initBot() {
    this.twitch.initBot().then(() => {
      this.kick.initBot();
    });
  }
  public updatePoll() {
    const combinedOptions = {};

    // Add options from poll1 to the combinedOptions
    if (this.kick.currentPoll != null) {
      this.kick.currentPoll.options.forEach((option) => {
        combinedOptions[option.id] = {
          label: option.label,
          votes: option.votes,
        };
      });
    }

    // Add or update options from poll2 to the combinedOptions
    //
    if (this.twitch.currentPoll != null) {
      this.twitch.currentPoll.options.forEach((option) => {
        if (combinedOptions.hasOwnProperty(option.id)) {
          combinedOptions[option.id].votes += option.votes;
        } else {
          combinedOptions[option.id] = {
            label: option.label,
            votes: option.votes,
          };
        }
      });
    }

    // Convert combinedOptions back to an array of options
    const combinedOptionsArray = Object.keys(combinedOptions).map((id) => ({
      id: parseInt(id),
      label: combinedOptions[id].label,
      votes: combinedOptions[id].votes,
    }));
    this.iopoll.emit("updatePoll", combinedOptionsArray);
  }
  public sendTTS(message: TTSMessage, isMod: boolean) {
    if ((!this.ttsEnabled && !isMod) || !message.text || !message.sender) {
      return;
    }
    if (isMod) {
      if (message.text === "enable") {
        this.ttsEnabled = true;
        this.sendTTS({ text: "Enabled TTS command!", sender: "Brian" }, true);
        return;
      } else if (message.text === "disable") {
        this.ttsEnabled = false;
        this.sendTTS({ text: "disabled TTS command!", sender: "Brian" }, true);
        return;
      }
    }

    this.iotts.emit("message", message);
  }
}
