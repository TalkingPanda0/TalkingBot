import { Twitch } from "./twitch";
import { Discord } from "./discord";
import { DB } from "./db";

import { Namespace, Server } from "socket.io";
import * as http from "http";
import { Pet } from "./pet";

import { Wheel } from "./wheel";
import { MessageHandler } from "./commands";
import { TTSManager } from "./tts";
import { Credits } from "./credits";
import { Users } from "./users";
import { WhereWord } from "./whereword";
import { Poll } from "./poll";

import { levelUp } from "./levels";
import { YouTube } from "./youtube";
import { ModuleManager } from "./moduleManager";
import { ChatLogger } from "./chatLogger";

export interface AuthSetup {
  twitchClientId: string;
  twitchClientSecret: string;
  channelName: string;
}

export interface DiscordAuthData {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface controlMessage {
  overlay: string;
  target: string;
  message: string;
}
export interface latestSub {
  name: string;
  pfpUrl: string;
  time: Date;
}

export class TalkingBot {
  public discord: Discord;
  public twitch: Twitch;
  public poll: Poll;
  public iochat: Namespace;
  public iomodtext: Namespace;
  public iopoll: Namespace;
  public ioalert: Namespace;
  public connectedtoOverlay: Boolean = false;
  public pet: Pet;
  public database: DB;
  public chatLogger: ChatLogger;
  public commandHandler: MessageHandler;
  public wheel: Wheel;
  public modtext: string = "";
  public ttsManager: TTSManager;
  public credits: Credits;
  public users: Users;
  public whereWord: WhereWord;
  public youtube: YouTube;
  public moduleManager: ModuleManager;
  private secretsFile = Bun.file(__dirname + "/../config/secrets.json");
  public jwtSecret: string | null = null;
  public discordRedirectUri: string = "";
  public discordLoginUri: string = "";

  constructor(server: http.Server) {
    const io = new Server(server);
    this.ttsManager = new TTSManager(io.of("tts"));

    this.iomodtext = io.of("modtext");

    this.iomodtext.on("connection", () => {
      this.updateModText();
    });

    this.iochat = io.of("chat");

    this.iochat.on("connect", () => {
      try {
        if (
          this.twitch.chatClient != null &&
          !this.twitch.chatClient.isConnected
        ) {
          this.iochat.emit("chatDisconnect", "twitch");
        }
        this.connectedtoOverlay = true;
      } catch (e) {
        console.error(e);
      }
    });
    this.iopoll = io.of("poll");
    this.ioalert = io.of("alerts");
    this.commandHandler = new MessageHandler(this);
    this.commandHandler.readCustomCommands();

    this.credits = new Credits(this);
    this.pet = new Pet();
    this.wheel = new Wheel();
    this.database = new DB();
    this.chatLogger = new ChatLogger(this);
    this.twitch = new Twitch(this);
    this.youtube = new YouTube(this);
    this.poll = new Poll(this.iopoll);
    this.discord = new Discord(this);
    this.moduleManager = new ModuleManager(this);
    this.users = new Users(this.database);
    this.whereWord = new WhereWord();
  }

  public async initBot() {
    const secrets = await this.secretsFile.json();
    this.jwtSecret = secrets.jwtSecret;
    this.discordRedirectUri = secrets.discordRedirectUri;
    this.discordLoginUri = secrets.discordLoginUri;

    this.discord.initBot();
    await this.twitch.initBot();
    this.users.init();
    this.commandHandler.init();
    await this.whereWord.init();
    this.moduleManager.init();

    this.modtext = this.database.getOrSetConfig("currentModtext", "");
    this.updateModText();

    setInterval(() => {
      levelUp(this);
    }, 60 * 1000);

    const latestSub = JSON.parse(
      this.database.getOrSetConfig("latestSub", JSON.stringify(null)),
    );
    if (latestSub != null) this.setLatestSub(latestSub);
  }

  public async cleanUp() {
    await this.twitch.cleanUp();
    this.discord.cleanUp();
    this.database.cleanUp();
  }

  public async parseClips(text: string): Promise<string> {
    let clipId = this.twitch.clipRegex.exec(text);
    if (clipId == null) clipId = this.twitch.wwwclipRegex.exec(text);
    if (clipId !== null) {
      const clip = await this.twitch.apiClient.clips.getClipById(clipId[1]);
      if (clip !== null) {
        return (
          text +
          `<a target="_blank" href="${clip.url}" style="border: none;padding: 4px;display: flex;align-content: center;margin-top: 5px;text-decoration: none;font-size: 15px;line-height: 25px;"> <img width="80" height="45" src="${clip.thumbnailUrl}" style="padding-right: 10px;"> ${clip.title}  <br> Clipped by ${clip.creatorDisplayName}</div></a>`
        );
      } else {
        console.error(
          "\x1b[35m%s\x1b[0m",
          `Failed getting clip info: ${clipId[1]}`,
        );
      }
    }
    return text;
  }

  public async broadcastMessage(message: string) {
    await Promise.all([this.twitch.say(message)]);
  }
  public updateModText() {
    if (!this.modtext) return;
    this.database.setConfig("currentModtext", this.modtext);
    this.iomodtext.emit(
      "message",
      this.modtext.replaceAll(/counter\((\w+)\)/g, (_modtext, counterName) => {
        const counter = this.commandHandler.counter.getCounter(counterName);
        if (counter) return counter.toString();
        else return "";
      }),
    );
  }
  public async getDiscordAccessToken(
    code: string,
  ): Promise<DiscordAuthData | null> {
    if (!code) return null;
    try {
      const response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: this.discord.clientId,
          client_secret: this.discord.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: this.discordRedirectUri,
          scope: "identify",
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  public handleControl(data: controlMessage) {
    switch (data.overlay) {
      case "chat":
        this.iochat.emit(data.target, data.message);
        break;

      case "modtext":
        if (data.target == "refresh") {
          this.iomodtext.emit("refresh");
          return;
        }
        this.modtext = data.message;
        this.updateModText();
        break;

      case "tts":
        this.ttsManager.io.emit(data.target, data.message);
        break;

      case "alerts":
        this.ioalert.emit(data.target, data.message);
        break;
    }
  }
  public setLatestSub(sub: latestSub) {
    this.database.setConfig("latestSub", JSON.stringify(sub));
    this.modtext = `<div style='display:grid; top: 150px;left: 5px;position: absolute; width:100px; height:150px '><div style="text-wrap: nowrap; text-align: center; font-size: 15px;">${sub.name}</div> <img src="${sub.pfpUrl}" height="100px" width="100px"></img></div>`;
    this.updateModText();
  }
}
