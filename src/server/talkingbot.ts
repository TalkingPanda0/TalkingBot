import { Twitch } from "./twitch.ts";
import { Discord } from "./discord.ts";
import { DB } from "./db.ts";

import { Namespace, Server } from "socket.io";
import * as http from "http";

import { MessageHandler } from "./commands.ts";
import { TTSManager } from "./tts.ts";
import { Credits } from "./credits.ts";
import { Poll } from "./poll.ts";

import { ModuleManager } from "./moduleManager.ts";
import { ChatLogger } from "./chatLogger.ts";
import {
  getCheerAudio,
  getDiscordJoinAudio,
  getFollowAudio,
  getKofiAudio,
  getRaidAudio,
  getSubAudio,
} from "./alerts.ts";
import { Canvas } from "fabric";
import { UserManager } from "./users.ts";
import { CONFIG } from "./env.ts";
import {
  AlertEvent,
  BitsAlert,
  ControlMessage,
  DiscordAuthData,
  DiscordJoinAlert,
  FollowAlert,
  KofiAlert,
  RaidAlert,
  SubAlert,
} from "../shared/types.ts";

export interface AuthSetup {
  twitchClientId: string;
  twitchClientSecret: string;
  channelName: string;
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
  public connectedtoOverlay: boolean = false;
  public database: DB;
  public chatLogger: ChatLogger;
  public commandHandler: MessageHandler;
  public latestSub: latestSub | null = null;
  public modtext: string | null = null;
  public modtextCanvas: Canvas | null = null;
  public ttsManager: TTSManager;
  public credits: Credits;
  public userManager: UserManager;
  public moduleManager: ModuleManager;

  constructor(server: http.Server) {
    const io = new Server(server);

    this.ttsManager = new TTSManager(io.of("tts"));

    this.iomodtext = io.of("modtext");

    this.iomodtext.on("connection", async () => {
      await this.updateModText();
      await this.updateModTextCanvas();
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
    this.database = new DB();
    this.chatLogger = new ChatLogger(this);
    this.twitch = new Twitch(this);
    this.poll = new Poll(this.iopoll);
    this.discord = new Discord(this);
    this.moduleManager = new ModuleManager(this);
    this.userManager = new UserManager(this);
  }

  public async initBot() {
    await this.discord.initBot();
    await this.twitch.initBot();
    this.commandHandler.init();
    this.moduleManager.init();

    this.latestSub = await this.database.getOrSetConfig("latestSub", null);
    this.modtext = await this.database.getOrSetConfig("currentModtext", null);
    this.modtextCanvas = await this.database.getOrSetConfig(
      "currentModtextCanvas",
      null,
    );

    await this.updateModText();
    await this.updateModTextCanvas();
    this.updateModTextData();
  }

  public onStreamOnline() {
    this.userManager.onStreamOnline();
  }

  public onStreamOffline() {
    this.userManager.onStreamOffline();
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
  public async updateModText() {
    if (!this.modtext) return;
    await this.database.setConfig("currentModtext", this.modtext);
    this.iomodtext.emit(
      "message",
      this.modtext.replaceAll(/counter\((\w+)\)/g, (_modtext, counterName) => {
        const counter = this.commandHandler.counter.getCounter(counterName);
        if (counter) return counter.toString();
        else return "";
      }),
    );
  }
  public async updateModTextCanvas() {
    if (!this.modtextCanvas) return;
    await this.database.setConfig("currentModtextCanvas", this.modtextCanvas);
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
      this.commandHandler.counter.counters.forEach(
        (value: any, counter: any) => {
          data.counters[counter] = value;
        },
      );
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
          client_id: CONFIG.discord.clientId,
          client_secret: CONFIG.discord.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: CONFIG.discord.redirectUrl,
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
  public async handleControl(data: ControlMessage) {
    switch (data.overlay) {
      case "chat":
        if (data.target == "refresh") {
          this.iochat.emit(data.target);
          return;
        }

        this.iochat.emit(data.target, data.message);
        break;
      case "modtext":
        if (data.target == "refresh") {
          this.iomodtext.emit(data.target);
          return;
        }

        this.modtext = data.message;
        await this.updateModText();
        break;
      case "alerts": {
        switch (data.message.type) {
          case "raidAlert":
            this.raidAlert(data.message);
            break;
          case "followAlert":
            this.followAlert(data.message);
            break;
          case "bitsAlert":
            this.bitsAlert(data.message);
            break;
          case "subAlert":
            this.subAlert(data.message);
            break;
          case "discordJoinAlert":
            this.discordJoinAlert(data.message);
            break;
          case "kofiAlert":
            this.kofiAlert(data.message);
            break;
        }
        break;
      }
    }
  }
  public async raidAlert(alert: RaidAlert) {
    this.emitAlert({
      audioList: await getRaidAudio(alert.raider, alert.viewers),
      ...alert,
      messageAudioList: null
    });
  }
  public async followAlert(alert: FollowAlert) {
    this.emitAlert({
      audioList: await getFollowAudio(alert.follower),
      ...alert,
      messageAudioList: null
    });
  }
  public async bitsAlert(alert: BitsAlert) {
    this.emitAlert({
      audioList: await getCheerAudio(alert.user, alert.bits, alert.message),
      ...alert,
      messageAudioList: null
    });
  }
  public async discordJoinAlert(alert: DiscordJoinAlert) {
    this.emitAlert({
      audioList: await getDiscordJoinAudio(alert.member),
      ...alert,
      messageAudioList: null,
    });
  }
  public async kofiAlert(alert: KofiAlert) {
    this.emitAlert({
      audioList: await getKofiAudio(
        alert.sender,
        alert.is_subscription,
        alert.tier_name ?? "",
        alert.amount,
        alert.currency,
      ),
      ...alert,
      messageAudioList: null,
    });
  }
  public async subAlert(alert: SubAlert) {
    this.emitAlert({
      audioList: await getSubAudio(alert.name),
      ...alert,
      messageAudioList: alert.message ? await getSubAudio(alert.message) : [],
    });
  }

  public async emitAlert(alert: AlertEvent) {
    this.ioalert.emit("alert", alert);
  }

  public async setLatestSub(sub: latestSub) {
    await this.database.setConfig("latestSub", sub);
    this.latestSub = sub;
    this.updateModTextData();
  }
}
