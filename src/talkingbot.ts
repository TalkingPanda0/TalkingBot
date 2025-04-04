import { Twitch } from "./twitch";
import { Discord } from "./discord";
import { YouTube } from "./youtube";
import { DB } from "./db";

import { Server } from "socket.io";
import * as http from "http";
import { Pet } from "./pet";

import { Wheel } from "./wheel";
import { MessageHandler } from "./commands";
import { TTSManager } from "./tts";
import { Credits } from "./credits";
import { Users } from "./users";
import { WhereWord } from "./whereword";
import { Poll } from "./poll";

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

export class TalkingBot {
  public discord: Discord;
  public twitch: Twitch;
  public youTube: YouTube;
  public poll: Poll;
  public iochat: Server;
  public iomodtext: Server;
  public iopoll: Server;
  public ioalert: Server;
  public connectedtoOverlay: Boolean = false;
  public pet: Pet;
  public database: DB;
  public commandHandler: MessageHandler;
  public wheel: Wheel;
  public modtext: string;
  public ttsManager: TTSManager;
  public credits: Credits;
  public users: Users;
  public whereWord: WhereWord;

  private server: http.Server;
  private secretsFile = Bun.file(__dirname + "/../config/secrets.json");
  public jwtSecret: string;
  public discordRedirectUri: string;
  public discordLoginUri: string;

  constructor(server: http.Server) {
    this.server = server;
    this.ttsManager = new TTSManager(server);

    this.iomodtext = new Server(this.server, {
      path: "/modtext/",
    });

    this.iomodtext.on("connection", () => {
      this.updateModText();
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

    this.commandHandler = new MessageHandler(this);
    this.commandHandler.readCustomCommands();

    this.credits = new Credits(this);
    this.pet = new Pet();
    this.wheel = new Wheel(this.server);
    this.database = new DB();
    this.twitch = new Twitch(this);
    this.youTube = new YouTube("UCTZw5BSoA8PcKyHbdHJ3hQg", this);
    this.poll = new Poll(this.iopoll);
    this.discord = new Discord(this);
    this.users = new Users(this.database);
    this.whereWord = new WhereWord();
  }

  public async initBot() {
    const secrets = await this.secretsFile.json();
    this.jwtSecret = secrets.jwtSecret;
    this.discordRedirectUri = secrets.discordRedirectUri;
    this.discordLoginUri = secrets.discordLoginUri;

    this.database.init();
    this.discord.initBot();
    await this.twitch.initBot();
    this.commandHandler.init();
    this.users.init();
    await this.whereWord.init();

    this.modtext = this.database.getOrSetConfig("currentModtext", "");
    this.updateModText();
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

  public broadcastMessage(message: string) {
    this.twitch.say(message);
    this.youTube.api.sendMessage(message);
  }
  public updateModText() {
    if (!this.modtext) return;
    this.database.setConfig("currentModtext", this.modtext);
    this.iomodtext.emit(
      "message",
      this.modtext.replaceAll(/counter\((\w+)\)/g, (_modtext, counter) =>
        this.commandHandler.counter.getCounter(counter).toString(),
      ),
    );
  }
  public async getUserIdFromCode(code: string): Promise<string> {
    if (!code) return;
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
      const data: DiscordAuthData = await response.json();
      const result = await fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${data.token_type} ${data.access_token}`,
        },
      });
      const userData = await result.json();
      return userData.id;
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
}
