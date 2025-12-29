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
import { ModuleManager } from "./moduleManager";
import { ChatLogger } from "./chatLogger";
import {
  getCheerAudio,
  getDiscordJoinAudio,
  getFollowAudio,
  getKofiAudio,
  getRaidAudio,
  getSubAudio,
} from "./alerts";
import { Canvas } from "fabric/fabric-impl";

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
  public latestSub: latestSub | null = null;
  public modtext: string = "";
  public modtextCanvas: Canvas | null = null;
  public ttsManager: TTSManager;
  public credits: Credits;
  public users: Users;
  public whereWord: WhereWord;
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
      this.updateModTextCanvas();
      this.updateModTextData();
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

    this.latestSub = JSON.parse(
      this.database.getOrSetConfig("latestSub", JSON.stringify(null)),
    );

    this.modtext = this.database.getOrSetConfig("currentModtext", "");
    this.modtextCanvas = JSON.parse(
      this.database.getOrSetConfig("currentModtextCanvas", "null"),
    );
    this.updateModText();
    this.updateModTextCanvas();
    this.updateModTextData();

    setInterval(() => {
      levelUp(this);
    }, 60 * 1000);
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
  public updateModTextCanvas() {
    if (!this.modtextCanvas) return;
    this.database.setConfig(
      "currentModtextCanvas",
      JSON.stringify(this.modtextCanvas),
    );
    this.iomodtext.emit("canvas", this.modtextCanvas);
  }

  public getModTextData(): any {
    const data: any = {};
    if (this.latestSub) {
      data.latestSub = this.latestSub.name;
      data.latestSubPfp = this.latestSub.pfpUrl;
    }
    data.counters = {};
    if (this.commandHandler.counter)
      this.commandHandler.counter.counters.forEach((value, counter) => {
        data.counters[counter] = value;
      });
    return data;
  }

  public updateModTextData() {
    this.iomodtext.emit("data", JSON.stringify(this.getModTextData()));
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
        const alert: any = data.message;
        if (alert.viewers !== undefined) this.raidAlert(alert);
        else if (alert.follower !== undefined) this.followAlert(alert);
        else if (alert.bits !== undefined) this.bitsAlert(alert);
        else if (alert.member !== undefined) this.discordJoinAlert(alert);
        else if (alert.is_subscription !== undefined) this.kofiAlert(alert);
        else this.subAlert(alert);
        break;
    }
  }
  private async raidAlert(alert: { raider: string; viewers: number }) {
    this.ioalert.emit("alert", {
      audioList: await getRaidAudio(alert.raider, alert.viewers),
      ...alert,
    });
  }
  private async followAlert(alert: { follower: string }) {
    this.ioalert.emit("alert", {
      audioList: await getFollowAudio(alert.follower),
      ...alert,
    });
  }
  private async bitsAlert(alert: {
    user: string;
    bits: number;
    message: string;
  }) {
    this.ioalert.emit("alert", {
      audioList: await getCheerAudio(alert.user, alert.bits, alert.message),
      ...alert,
    });
  }
  private async discordJoinAlert(alert: { member: string }) {
    this.ioalert.emit("alert", {
      audioList: await getDiscordJoinAudio(alert.member),
      ...alert,
    });
  }
  private async kofiAlert(alert: {
    is_subscription: boolean;
    message: string | null;
    sender: string;
    tier_name: string | null;
    amount: string;
    currency: string;
  }) {
    this.ioalert.emit("alert", {
      audioList: await getKofiAudio(
        alert.sender,
        alert.is_subscription,
        alert.tier_name ?? "",
        alert.amount,
        alert.currency,
      ),
      ...alert,
    });
  }
  private async subAlert(alert: { name: string; message: string }) {
    this.ioalert.emit("alert", {
      audioList: await getSubAudio(alert.name),
      messageAudioList: alert.message ? await getSubAudio(alert.message) : [],
      ...alert,
    });
  }
  public setLatestSub(sub: latestSub) {
    this.database.setConfig("latestSub", JSON.stringify(sub));
    this.latestSub = sub;
    this.updateModTextData();
  }
}
