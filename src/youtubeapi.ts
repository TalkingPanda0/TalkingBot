import { OAuth2Client } from "google-auth-library";
import { google, youtube_v3 } from "googleapis";

export class YouTubeAPI {
  public chatId: string | null | undefined = null;
  private videoId: string | null | undefined = null;
  private youtubeClient!: youtube_v3.Youtube;
  private oAuth2Client!: OAuth2Client;
  private editoroAuth2Client!: OAuth2Client;
  private tokenFile = Bun.file(__dirname + "/../config/yt.json");
  private channelId: string;
  private apiKey: string = "";

  private log(message: any) {
    console.log("\x1b[31m%s\x1b[0m", message);
  }
  private error(message: any) {
    console.error("\x1b[31m%s\x1b[0m", message);
  }

  public async getVideoId() {
    try {
      const result = await this.youtubeClient.search.list({
        auth: this.oAuth2Client,
        channelId: this.channelId,
        type: ["video"],
        eventType: "live",
        maxResults: 1,
        part: ["snippet"],
      });
      const stream = result.data.items?.at(0);
      if (!stream) return;
      this.videoId = stream.id?.videoId;
    } catch (e) {
      this.error(e);
    }
  }

  public async getChatId() {
    try {
      if (!this.videoId) {
        await this.getVideoId();
        if (!this.videoId) return;
      }
      this.chatId = await this.getChatIdFromVideoID(this.videoId);
      this.log(`Connected to chat: ${this.chatId}`);
    } catch (e) {
      this.error(`getChatId: ${e}`);
    }
  }

  public async getChatIdFromVideoID(videoId: string): Promise<string | null> {
    try {
      this.videoId = videoId;

      const response = await this.youtubeClient.videos.list({
        auth: this.oAuth2Client,
        id: [this.videoId],
        part: ["liveStreamingDetails"],
      });

      const chatId =
        response.data.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

      this.chatId = chatId;
      return chatId ?? null;
    } catch (e) {
      this.error(`getChatId: ${e}`);
      return null;
    }
  }
  public async sendMessage(message: string) {
    return;
    try {
      const msg: youtube_v3.Schema$LiveChatMessage = {
        snippet: {
          liveChatId: this.chatId,
          type: "textMessageEvent",
          textMessageDetails: { messageText: message },
        },
      };
      await this.youtubeClient.liveChatMessages.insert({
        auth: this.oAuth2Client,
        requestBody: msg,
        part: ["snippet"],
      });
    } catch (e) {
      this.error(`sendMessage: ${e}`);
    }
  }

  public async setupAPI() {
    const credentials = await this.tokenFile.json();
    this.apiKey = credentials.apiKey;
    this.oAuth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      "http://localhost",
    );

    this.editoroAuth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      "http://localhost",
    );

    google.options({ auth: this.oAuth2Client });
    this.oAuth2Client.setCredentials(credentials.token);
    this.editoroAuth2Client.setCredentials(credentials.editorToken);
    this.youtubeClient = google.youtube({ version: "v3" });

    await this.getChatId();
  }

  public onStreamEnd() {
    this.videoId = null;
    this.chatId = null;
  }

  public async setTitle(title: string) {
    try {
      await this.youtubeClient.videos.update({
        auth: this.editoroAuth2Client,
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
      this.error(`setTitle: ${e}`);
    }
  }
  public async banUser(userId: string, seconds?: number) {
    try {
      await this.youtubeClient.liveChatBans.insert({
        auth: this.editoroAuth2Client,
        requestBody: {
          snippet: {
            type: seconds == null ? "permanant" : "temporary",
            liveChatId: this.chatId,
            bannedUserDetails: { channelId: userId },
            banDurationSeconds: seconds != null ? seconds.toString() : seconds,
          },
        },
      });
    } catch (e) {
      this.error(e);
      this.error(`banUser: ${e}`);
    }
  }
  public getApiKey(): string | undefined {
    return this.apiKey;
  }

  constructor(channelId: string) {
    this.channelId = channelId;
  }
}
