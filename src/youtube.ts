import { TalkingBot, Platform } from "./talkingbot";
import { userColors } from "./twitch";
import { CommandData } from "./commands";
import { OAuth2Client } from "google-auth-library";
import { google, youtube_v3 } from "googleapis";
import { youtube } from "googleapis/build/src/apis/youtube";

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
  private channelName: string;
  private youtubeClient: youtube_v3.Youtube;
  private oAuth2Client: OAuth2Client;
  private tokenFile = Bun.file(__dirname + "/../config/yt.json");
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
  public cleanUp() {}

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
    const liveId = (
      await this.youtubeClient.search.list({
        auth: this.oAuth2Client,
        channelId: channelId,
        part: ["snippet"],
        eventType: "live",
        type: ["video"],
      })
    ).data.items[0].id.videoId;
    console.log(liveId);
    const chatId = (
      await this.youtubeClient.videos.list({
        auth: this.oAuth2Client,
        id: [liveId],
        part: ["liveStreamingDetails"],
      })
    ).data.items[0].liveStreamingDetails.activeLiveChatId;
    console.log(chatId);
    const messages = await this.youtubeClient.liveChatMessages.list({
      auth: this.oAuth2Client,
      liveChatId: chatId,
      part: ["snippet", "authorDetails"],
    });
    console.log(
      `${messages.data.items[0].authorDetails.displayName}: ${messages.data.items[0].snippet.displayMessage}`,
    );
  }

  constructor(channelName: string, bot: TalkingBot) {
    this.channelName = channelName;
    this.bot = bot;
  }
}
