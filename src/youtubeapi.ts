import { OAuth2Client } from "google-auth-library";
import { google, youtube_v3 } from "googleapis";

export class YouTubeAPI {
  private chatId: string;
  private videoId: string;
  private youtubeClient: youtube_v3.Youtube;
  private oAuth2Client: OAuth2Client;
  private editoroAuth2Client: OAuth2Client;
  private tokenFile = Bun.file(__dirname + "/../config/yt.json");

  private log(message: any) {
    console.log("\x1b[31m%s\x1b[0m", message);
  }
  private error(message: any) {
    console.error("\x1b[31m%s\x1b[0m", message);
  }

  public async getChatId(videoId: string) {
    try {
      this.videoId = videoId;
      const chatId = (
        await this.youtubeClient.videos.list({
          auth: this.oAuth2Client,
          id: [this.videoId],
          part: ["liveStreamingDetails"],
        })
      ).data.items[0].liveStreamingDetails.activeLiveChatId;
      this.chatId = chatId;
      this.log(`Connected to chat: ${chatId}`);
      return true;
    } catch (e) {
      this.error(e);
      return false;
    }
  }
  public async sendMessage(message: string) {
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
      this.error(e);
    }
  }

  public async setupAPI() {
    const credentials = await this.tokenFile.json();
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
  }

	public onStreamEnd(){
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
      this.error(e);
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
            banDurationSeconds: seconds.toString(),
          },
        },
      });
    } catch (e) {
      this.error(e);
    }
  }

  constructor() {}
}
