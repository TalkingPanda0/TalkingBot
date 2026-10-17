import { Twitch } from "./twitch.ts";
import { Discord } from "./discord.ts";
import { Namespace, Server } from "socket.io";
import * as http from "http";

import { MessageHandler } from "./commands.ts";
import { AlertsManager } from "./alerts.ts";
import { Credits } from "./credits.ts";

import { ModuleManager } from "./moduleManager.ts";
import { ChatLogger } from "./chatLogger.ts";
import { Canvas } from "fabric";
import { UserManager } from "./users.ts";
import { CONFIG } from "./env.ts";
import { ControlMessage, DiscordAuthData } from "../shared/types.ts";
import { Database } from "./database.ts";

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
  public iochat: Namespace;
  public iomodtext: Namespace;
  public iopoll: Namespace;
  public connectedtoOverlay: boolean = false;
  public database = new Database();
  public chatLogger: ChatLogger;
  public commandHandler: MessageHandler;
  public latestSub: latestSub | null = null;
  public modtext: string | null = null;
  public modtextCanvas: Canvas | null = null;
  public alertsManager: AlertsManager;
  public credits: Credits;
  public userManager: UserManager;
  public moduleManager: ModuleManager;

  constructor(server: http.Server) {
    const io = new Server(server);

    this.alertsManager = new AlertsManager(io.of("alerts"));

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
    this.commandHandler = new MessageHandler(this);
    this.commandHandler.readCustomCommands();

    this.chatLogger = new ChatLogger(this);
    this.twitch = new Twitch(this);
    this.discord = new Discord(this);
    this.credits = new Credits(this);
    this.moduleManager = new ModuleManager(this);
    this.userManager = new UserManager(this);
  }

  public async initBot() {
    await this.discord.initBot();
    await this.twitch.initBot();
    this.commandHandler.init();
    this.moduleManager.init();

    this.latestSub = await this.database.getConfig("latestSub");
    this.modtext = await this.database.getConfig("currentModtext");
    this.modtextCanvas = await this.database.getConfig("currentModtextCanvas");

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
    await this.userManager.cleanUp();
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
            this.alertsManager.raidAlert(data.message);
            break;
          case "followAlert":
            this.alertsManager.followAlert(data.message);
            break;
          case "bitsAlert":
            this.alertsManager.bitsAlert(data.message, data.message.message);
            break;
          case "subAlert":
            this.alertsManager.subAlert(data.message, data.message.message);
            break;
          case "discordJoinAlert":
            this.alertsManager.discordJoinAlert(data.message);
            break;
          case "kofiAlert":
            this.alertsManager.kofiAlert(data.message);
            break;
        }
        break;
      }
    }
  }

  public async setLatestSub(sub: latestSub) {
    await this.database.setConfig("latestSub", sub);
    this.latestSub = sub;
    this.updateModTextData();
  }
}
