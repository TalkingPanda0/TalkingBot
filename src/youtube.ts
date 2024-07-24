import { TalkingBot, Platform } from "./talkingbot";
import { userColors } from "./twitch";
import { YoutubeCommandData } from "./commands";
import { OAuth2Client } from "google-auth-library";
import { google, youtube_v3 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];
const channelId = "UCpvMRWN1QWeFaR-W_B96GnA";

export function parseYTMessage(message: any): string {
  let text = "";
  for (let i = 0; i < message.length; i++) {
    const fragment: any = message.at(i);
    if (fragment.text !== undefined) {
      text += fragment.text;
    } else if (fragment.emoji !== undefined) {
      text += `<img src="${fragment.emoji}" class="emote" />`;
    }
  }
  return text;
}

export class YouTube {
  public isConnected: boolean = false;

  private bot: TalkingBot;
  private videoId: string;
  private chatId: string;
  private nextPageToken: string;
  private youtubeClient: youtube_v3.Youtube;
  private oAuth2Client: OAuth2Client;
  private tokenFile = Bun.file(__dirname + "/../config/yt.json");

  private log(message: any) {
    console.log("\x1b[31m%s\x1b[0m", message);
  }
  private error(message: any) {
    console.error("\x1b[31m%s\x1b[0m", message);
  }
  private getColor(username: string): string {
    let hash = 0,
      i: number,
      chr: number;
    for (i = 0; i < username.length; i++) {
      chr = username.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return userColors[Math.abs(hash % userColors.length)];
  }

  private async getChatId(): Promise<boolean> {
    try {
      const video = await this.youtubeClient.search.list({
        auth: this.oAuth2Client,
        channelId: channelId,
        part: ["snippet"],
        eventType: "live",
        type: ["video"],
      });
      const liveId = video.data.items[0].id.videoId;
      console.log(video.data.items[0]);
      this.log(`Found video: ${liveId}`);
      const chatId = (
        await this.youtubeClient.videos.list({
          auth: this.oAuth2Client,
          id: [liveId],
          part: ["liveStreamingDetails"],
        })
      ).data.items[0].liveStreamingDetails.activeLiveChatId;
      this.chatId = chatId;
      this.videoId = liveId;
      this.log(`Connected to chat: ${chatId}`);
      return true;
    } catch (e) {
      this.error(e);
      return false;
    }
  }

  private sendToChatList(
    message: youtube_v3.Schema$LiveChatMessage,
    isCommand: boolean,
  ) {
    this.bot.iochat.emit("message", {
      text: message.snippet.displayMessage,
      sender: message.authorDetails.displayName,
      senderId: "youtube-" + message.authorDetails.channelId,
      badges: ["https://www.youtube.com/favicon.ico"],
      color: this.getColor(message.authorDetails.displayName),
      id: "youtube-" + message.id,
      platform: "youtube",
      isCommand: isCommand,
    });
  }
  private async sendMessage(message: string) {
    const msg: youtube_v3.Schema$LiveChatMessage = {
      snippet: {
        liveChatId: this.chatId,
        type: "textMessageEvent",
        textMessageDetails: { messageText: message },
      },
    };
    this.youtubeClient.liveChatMessages.insert({
      auth: this.oAuth2Client,
      requestBody: msg,
      part: ["snippet"],
    });
  }

  private async onMessage(message: youtube_v3.Schema$LiveChatMessage) {
    message.snippet.authorChannelId;
    const user = message.authorDetails.displayName;
    const text = message.snippet.displayMessage;
    const isUserMod =
      message.authorDetails.isChatModerator ||
      message.authorDetails.isChatOwner;
    this.log(`YouTube - ${user}: ${text}`);
    if (!text.startsWith("!")) {
      this.sendToChatList(message, false);
      return;
    }
    const commandName = text.split(" ")[0];
    const data: YoutubeCommandData = {
      user: user,
      message: text.replace(commandName, "").trim(),
      reply: (message) => {
        this.sendMessage(message);
      },
      context: message,
      platform: Platform.youtube,
      isUserMod: isUserMod,
      userColor: this.getColor(message.authorDetails.displayName),
    };
    const showOnChat = await this.bot.commandHandler.handleCommand(
      commandName,
      data,
    );
    this.sendToChatList(message, !showOnChat);
  }

  private async getMessages() {
    try {
      const messages = await this.youtubeClient.liveChatMessages.list({
        auth: this.oAuth2Client,
        liveChatId: this.chatId,
        part: ["snippet", "authorDetails"],
        pageToken: this.nextPageToken,
      });
      if (messages.data.offlineAt) {
        this.disconnect();
        return;
      }
      messages.data.items.forEach((value) => {
        this.onMessage(value);
      });
      setTimeout(
        () => this.getMessages(),
        messages.data.pollingIntervalMillis * 10,
      );

      this.nextPageToken = messages.data.nextPageToken;
    } catch (e) {
      this.error(e);
      setTimeout(() => this.getMessages(), 15 * 1000);
    }
  }

  private disconnect() {
    this.chatId = null;
    this.nextPageToken = null;
    this.isConnected = false;
    this.bot.iochat.emit("chatDisconnect", "YouTube");
  }

  public async initBot() {
    const credentials = await this.tokenFile.json();
    this.oAuth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      "http://localhost",
    );
    google.options({ auth: this.oAuth2Client });
    if (credentials.token == null) {
      const authUrl = this.oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      console.log("Authorize this app by visiting this url:", authUrl);

      process.stdout.write("Enter the code from that page here: ");
      for await (const code of console) {
        this.oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error("Error retrieving access token", err);
          console.log(token);
          this.oAuth2Client.setCredentials(token);
          credentials.code = token;
        });
        if (credentials.code != null) break;
      }
      Bun.write(this.tokenFile, JSON.stringify(credentials));
    }

    this.oAuth2Client.setCredentials(credentials.token);
    this.youtubeClient = google.youtube({ version: "v3" });
  }
  public async connectToChat() {
    let connected = await this.getChatId();
    while (!connected) {
      await new Promise(() =>
        setTimeout(async () => {
          connected = await this.getChatId();
        }, 60 * 1000),
      );
    }
    this.getMessages();
    this.bot.iochat.emit("chatConnect", "YouTube");
    this.isConnected = true;
  }

  public async setTitle(title: string) {
    try {
      this.log(this.videoId);
      this.log(title);
      await this.youtubeClient.videos.update({
        auth: this.oAuth2Client,
        requestBody: {
          id: this.videoId,
          snippet: {
            title: title,
            categoryId: "20", // Gaming
          },
        },
        part: ["snippet"],
      });
    } catch (e) {
      this.error(e);
    }
  }

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }
}
