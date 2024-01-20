import { ChatMessage } from "@twurple/chat";
import { Twitch } from "./twitch";
import { Kick } from "./kick";
import { HelixGame } from "@twurple/api";

import { Server } from "socket.io";
import * as http from "http";

export enum Platform {
  twitch,
  kick,
}
export interface Command {
  command: string;
  commandFunction: (
    user: string,
    isUserMod: boolean,
    message: string,
    reply: Function,
    platform: Platform,
    context?: any,
  ) => void | Promise<void>;
}

export interface TTSMessage {
  text: string;
  sender: string;
}
export interface AuthSetup {
  twitchClientId: string;
  twitchClientSecret: string;
  channelName: string;
}
export interface chatMsg {
  text: string;
  sender: string;
  badges: string[];
  color: string;
}

function removeByIndex(str: string, index: number): string {
  return str.slice(0, index) + str.slice(index + 1);
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

function parseEmotes(message: string): string {
  const regex = /\[emote:(\d+):([^\]]+)\]/g;
  return message
    .replace(regex, (match, id, name) => name)
    .replace("sweetbabooo-o", "");
}

export class TalkingBot {
  public twitch: Twitch;
  public kick: Kick;

  private kickId: string;
  private commandList: Command[] = [];
  private server: http.Server;
  private iotts: Server;
  private iochat: Server;
  private ttsEnabled: Boolean = false;

  constructor(kickId: string, server: http.Server) {
    this.server = server;

    this.iotts = new Server(this.server, {
      path: "/tts/",
    });

    this.iochat = new Server(this.server, {
      path: "/chat/",
    });

    this.kickId = kickId;

    this.commandList = [
      {
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
            );
          } catch {
            reply("Failed getting data");
          }
        },
      },
      {
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

          reply(`Title has been changed to "${message}"`);
        },
      },
      {
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
            reply(`Can't find game "${message}"`);
            return;
          }
          await this.twitch.apiClient.channels.updateChannelInfo(
            this.twitch.channel.id,
            { gameId: game.id },
          );
          // TODO change game in kick

          reply(`Game has been changed to "${game.name}"`);
        },
      },
      {
        command: "!adopt",

        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(`${message} has been adopted by @${user}!`);
        },
      },
      {
        command: "!socials",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply("SweetbabooO_o's socials: https://linktr.ee/SweetbabooO_o");
        },
      },
      {
        command: "!yt",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(
            "SweetbabooO_o's Youtube channel: https://www.youtube.com/channel/UC1dRtHovRsOwq2qSComV_OQ",
          );
        },
      },
      {
        command: "!twitch",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(
            "SweetbabooO_o's Twitch channel: https://www.twitch.tv/sweetbabooo_o",
          );
        },
      },
      {
        command: "!kick",
        commandFunction(user, isUserMod, message, reply, platform, context) {
          reply(
            "SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o/",
          );
        },
      },
      {
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
          this.twitch.sendMessage(`!bsr ${message}`);
        },
      },
      {
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
              text: parseEmotes(message),
              sender: user,
            };
            this.sendTTS(ttsMessage, false);
          }
        },
      },
      {
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
              text: parseEmotes(message),
              sender: user,
            };
            this.sendTTS(ttsMessage, true);
          }
        },
      },
    ];

    this.twitch = new Twitch(this.commandList, this);
    this.kick = new Kick(this.kickId, this.commandList, this);
  }
  public initBot() {
    this.twitch.initBot().then(() => {
      this.kick.initBot();
    });
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

  public sendToChat(message: chatMsg) {
    this.iochat.emit("message", message);
  }
}
