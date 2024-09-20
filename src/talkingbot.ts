import { Twitch } from "./twitch";
import { Discord } from "./discord";
import { YouTube } from "./youtube";
import { Kick } from "./kick";
import { DB } from "./db";

import { Server } from "socket.io";
import * as http from "http";
import { Pet } from "./pet";

import { Wheel } from "./wheel";
import { MessageHandler } from "./commands";
import { json } from "body-parser";

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
  public commandHandler: MessageHandler;
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
      this.updateModText();
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
          this.iochat.emit("chatDisconnect", "twitch");
        }
        if (!this.kick.isConnected) {
          this.iochat.emit("chatDisconnect", "kick");
        }
        if (!this.youTube.isConnected) {
          this.iochat.emit("chatDisconnect", "youtube");
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
            this.modtext = data.message;

            this.updateModText();
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

    this.commandHandler = new MessageHandler(this);
    this.commandHandler.readCustomCommands();

    this.pet = new Pet(this);
    this.wheel = new Wheel(this.server);
    this.database = new DB();
    this.twitch = new Twitch(this);
    this.kick = new Kick(this.kickId, this);
    this.youTube = new YouTube("sweetbaboostreams1351", this);
    this.discord = new Discord(this);
  }

  public async initBot() {
    this.database.init();
    this.database.cleanDataBase();
    this.discord.initBot();
    await this.twitch.initBot();
    this.kick.initBot();
    this.youTube.initBot();
  }

  public async cleanUp() {
    await this.twitch.cleanUp();
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

  public broadcastMessage(message: string) {
    this.twitch.say(message);
    this.youTube.api.sendMessage(message);
  }
  public updateModText() {
    Bun.write(
      this.commandHandler.counterFile,
      JSON.stringify({
        counter: this.commandHandler.counter,
        modtext: this.modtext,
      }),
    );
    if (!this.modtext) return;
    this.iomodtext.emit("message", {
      text: this.modtext,
      counter: this.commandHandler.counter,
    });
  }
}
