import { Twitch } from "./twitch";
import { Discord } from "./discord";
import { YouTube } from "./youtube";
import { Kick } from "./kick";
import { DB } from "./db";

import { Server } from "socket.io";
import * as http from "http";
import { Pet } from "./pet";

import { Wheel } from "./wheel";
import { CommandHandler } from "./commands";

export enum Platform {
  twitch,
  kick,
  youtube,
}

export interface AuthSetup {
  twitchClientId: string;
  twitchClientSecret: string;
  channelName: string;
}

export interface pollOption {
  id: string;
  label: string;
  votes: number;
}
export interface Poll {
  title: string;
  options: pollOption[];
  id?: string;
}
interface controlMessage {
  overlay: string;
  target: string;
  message: string;
}

export function getTimeDifference(startDate: Date, endDate: Date): string {
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
  const remainingTime5 = remainingTime4 % (1000 * 60);
  const seconds = Math.floor(remainingTime5 / 1000);

  let timeString = "";
  if (years != 0) timeString += `${years} years `;
  if (months != 0) timeString += `${months} months `;
  if (days != 0) timeString += `${days} days `;
  if (hours != 0) timeString += `${hours} hours `;
  if (minutes != 0) timeString += `${minutes} minutes `;
  if (seconds != 0) timeString += `${seconds} seconds`;
  return timeString;
}
export function milliSecondsToString(timeDifference: number): string {
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const remainingTime4 = timeDifference % (1000 * 60 * 60);
  const minutes = Math.floor(remainingTime4 / (1000 * 60));
  const remainingTime5 = remainingTime4 % (1000 * 60);
  const seconds = Math.floor(remainingTime5 / 1000);

  let timeString = "";
  if (hours != 0) timeString += `${hours} hours `;
  if (minutes != 0) timeString += `${minutes} minutes `;
  if (seconds != 0) timeString += `${seconds} seconds`;
  return timeString;
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

export function getSuffix(i: number) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export function getRandomElement(array: string[]): string {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export class TalkingBot {
  public discord: Discord;
  public twitch: Twitch;
  public youTube: YouTube;
  public kick: Kick;
  public iochat: Server;
  public iomodtext: Server;
  public iopoll: Server;
  public ioalert: Server;
  public iocontrol: Server;
  public connectedtoOverlay: Boolean = false;
  public pet: Pet;
  public database: DB;
  public commandHandler: CommandHandler;
  public wheel: Wheel;
  public modtext: string;
  public iotts: Server;

  private kickId: string;
  private server: http.Server;

  constructor(kickId: string, server: http.Server) {
    this.server = server;

    this.iomodtext = new Server(this.server, {
      path: "/modtext/",
    });

    this.iomodtext.on("connection", (socket) => {
      socket.emit("message", this.modtext);
    });

    this.iotts = new Server(this.server, {
      path: "/tts/",
    });

    this.iochat = new Server(this.server, {
      path: "/chat/",
    });

    this.iochat.on("connect", () => {
      try {
        this.twitch.sendRecentMessages();
        if (
          this.twitch.chatClient != null &&
          !this.twitch.chatClient.isConnected
        ) {
          this.iochat.emit("chatDisconnect", "Twitch");
        }
        if (!this.kick.isConnected) {
          this.iochat.emit("chatDisconnect", "Kick");
        }
        if (!this.youTube.isConnected) {
          this.iochat.emit("chatDisconnect", "YouTube");
        }
        this.connectedtoOverlay = true;
      } catch (e) {
        console.error(e);
      }
    });
    this.iopoll = new Server(this.server, {
      path: "/poll/",
    });
    this.ioalert = new Server(this.server, {
      path: "/alerts/",
    });

    this.iocontrol = new Server(this.server, {
      path: "/control/",
    });
    this.iocontrol.on("connect", (socket) => {
      socket.on("control", (data: controlMessage) => {
        console.log(data);
        switch (data.overlay) {
          case "chat":
            this.iochat.emit(data.target, data.message);
            break;
          case "modtext":
            this.iomodtext.emit(data.target, data.message);
            break;
          case "tts":
            this.iotts.emit(data.target, data.message);
            break;
          case "alerts":
            this.ioalert.emit(data.target, data.message);
            break;
        }
      });
    });

    this.kickId = kickId;

    this.pet = new Pet(this);
    this.wheel = new Wheel(this.server);
    this.database = new DB();
    this.twitch = new Twitch(this);
    this.kick = new Kick(this.kickId, this);
    this.youTube = new YouTube("sweetbaboostreams1351", this);
    this.discord = new Discord(this);
    this.commandHandler = new CommandHandler(this);
    this.commandHandler.readCustomCommands();
  }

  public initBot() {
    this.database.init();
    this.discord.initBot();
    this.youTube.initBot();
    this.twitch.initBot();
    this.kick.initBot();
  }

  public async cleanUp() {
    await this.twitch.cleanUp();
    this.youTube.cleanUp();
    this.kick.cleanUp();
    this.discord.cleanUp();
    this.database.cleanUp();
  }

  public updatePoll() {
    const combinedOptions = {};

    if (this.kick.currentPoll != null) {
      this.kick.currentPoll.options.forEach((option) => {
        combinedOptions[option.id] = {
          label: option.label,
          votes: option.votes,
        };
      });
    }

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

    const combinedOptionsArray = Object.keys(combinedOptions).map((id) => ({
      id: parseInt(id),
      label: combinedOptions[id].label,
      votes: combinedOptions[id].votes,
    }));
    this.iopoll.emit("updatePoll", combinedOptionsArray);
  }

  public async parseClips(text: string): Promise<string> {
    const clipId = this.twitch.clipRegex.exec(text);
    if (clipId !== null) {
      const clip = await this.twitch.apiClient.clips.getClipById(clipId[1]);
      if (clip !== null) {
        return (
          text +
          `<a target="_blank" href="${clip.url}" style="text-decoration: none;"><div style="background-color: #191b1f;box-shadow: 0 1px 2px rgba(0,0,0,.9),0 0px 2px rgba(0,0,0,.9);border-radius: 0.2rem;border: none;padding: 4px;display: flex;align-content: center;margin-top: 5px;text-decoration: none;font-size: 15px;line-height: 25px;"> <img width="80" height="45" src="${clip.thumbnailUrl}" style="padding-right: 10px;"> ${clip.title}  <br> Clipped by ${clip.creatorDisplayName}</div></a>`
        );
      } else {
        console.error(
          "\x1b[35m%s\x1b[0m",
          `Failed getting clip info: ${clipId[1]}`,
        );
      }
    }
    const wwwclipId = this.twitch.wwwclipRegex.exec(text);
    if (wwwclipId !== null) {
      const clip = await this.twitch.apiClient.clips.getClipById(wwwclipId[1]);
      if (clip !== null) {
        return (
          text +
          `<a target="_blank" href="${clip.url}" style="text-decoration: none;"><div style="background-color: #191b1f;box-shadow: 0 1px 2px rgba(0,0,0,.9),0 0px 2px rgba(0,0,0,.9);border-radius: 0.2rem;border: none;padding: 4px;display: flex;align-content: center;margin-top: 5px;text-decoration: none;font-size: 15px;line-height: 25px;"> <img width="80" height="45" src="${clip.thumbnailUrl}" style="padding-right: 10px;"> ${clip.title}  <br> Clipped by ${clip.creatorDisplayName}</div></a>`
        );
      } else {
        console.error(
          "\x1b[35m%s\x1b[0m",
          `Failed getting clip info: ${wwwclipId[1]}`,
        );
      }
    }
    return text;
  }
}
