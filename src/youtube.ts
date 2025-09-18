import { TalkingBot } from "./talkingbot";
import { userColors } from "./twitch";
import { YouTubeAPI } from "./youtubeapi";
import { LiveChatMessageListResponse } from "./proto/youtube/api/v3/LiveChatMessageListResponse";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { LiveChatMessage } from "./proto/youtube/api/v3/LiveChatMessage";
import { arraytoHashMap, replaceMap } from "./util";

export class YouTube {
  public isConnected: boolean = false;
  public api: YouTubeAPI;
  public permTitle: string | null = null;

  private bot: TalkingBot;
  private channelId: string;
  private nextPageToken: string | undefined;
  private metadata!: grpc.Metadata;

  private protoDescriptor: any;
  private currentCall: grpc.ClientReadableStream<LiveChatMessageListResponse> | null =
    null;
  private client: any = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private emotes: Map<string, string>;

  constructor(bot: TalkingBot) {
    const channelId = process.env.YT_CHANNEL_ID;
    if (channelId == null) {
      console.error("YT_CHANNEL_ID not set!");
      process.exit(1);
    }
    this.channelId = channelId;
    this.bot = bot;
    this.api = new YouTubeAPI(this.channelId);

    const packageDefinition = protoLoader.loadSync(
      __dirname + "/../streamlist.proto",
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    );
    this.protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    const LiveChatService =
      this.protoDescriptor.youtube.api.v3.V3DataLiveChatMessageService;
    const client = new LiveChatService(
      "youtube.googleapis.com:443",
      grpc.credentials.createSsl(),
    );
    this.client = client;
    this.emotes = new Map();
  }

  private getColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      const chr = username.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return userColors[Math.abs(hash % userColors.length)];
  }

  public cleanUp() {
    this.cleanupStream();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.client.close();
  }

  public onStreamEnd() {
    if (this.permTitle) this.api.setTitle(this.permTitle);
    this.api.onStreamEnd();
  }

  public async initBot() {
    this.getEmoteMap();
    await this.api.setupAPI();
    const apiKey = this.api.getApiKey();
    if (!apiKey) {
      console.error("Can't get yt api key.");
      return;
    }

    this.metadata = new grpc.Metadata();
    this.metadata.add("x-goog-api-key", apiKey);

    this.streamMessages();
  }
  private async getEmoteMap() {
    const emotes: { key: string; value: string }[] = await Bun.file(
      `${__dirname}/../config/ytEmotes.json`,
    ).json();
    this.emotes = arraytoHashMap(emotes);
  }

  private parseEmotes(message: string): string {
    return replaceMap(
      this.emotes,
      message,
      (emote) => `<img onload="emoteLoaded()" src="${emote}" class="emote" />`,
    );
  }

  private cleanupStream() {
    if (this.currentCall) {
      this.currentCall.removeAllListeners();
      this.currentCall.cancel();
      this.currentCall = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.streamMessages();
    }, 1000);
  }

  private streamMessages() {
    this.cleanupStream();

    const callStream = this.client.StreamList(
      {
        part: ["snippet", "authorDetails", "id"],
        live_chat_id: this.api.chatId,
        max_results: 2000,
        page_token: this.nextPageToken,
      },
      this.metadata,
    );
    this.currentCall = callStream;

    callStream.on("data", (response: LiveChatMessageListResponse) => {
      response.items?.forEach((item) => this.handleEvent(item));
      this.nextPageToken = response.next_page_token;
    });

    callStream.on("end", () => {
      if (!this.nextPageToken) {
        console.log("Stream ended.");
        return;
      }
      this.scheduleReconnect();
    });

    callStream.on("error", (err: any) => {
      console.error("Stream error:", err);
      this.scheduleReconnect();
    });
  }

  private handleEvent(message: LiveChatMessage) {
    switch (message.snippet?.type) {
      case "TEXT_MESSAGE_EVENT":
        if (
          !message.author_details?.display_name ||
          !message.snippet.display_message ||
          !message.author_details?.channel_id ||
          !message.id
        )
          return;

        console.log(
          `${message.author_details?.display_name}: ${message.snippet?.display_message}`,
        );

        const badges = [];
        if (message.author_details?.is_chat_moderator) {
          badges.push("/ytmod.svg");
        }

        this.bot.commandHandler.handleMessage({
          badges,
          isUserMod:
            (message.author_details?.is_chat_moderator ||
              message.author_details?.is_chat_owner) ??
            false,
          reply: async (msg, _replyToUser) => {
            try {
              await this.api.sendMessage(msg);
            } catch (e) {
              console.error(e);
            }
          },
          message: message.snippet.display_message,
          parsedMessage: this.parseEmotes(message.snippet.display_message),
          banUser: async (_reason, duration) => {
            try {
              await this.api.banUser(
                message.author_details?.channel_id!,
                duration,
              );
            } catch (e) {
              console.error(e);
            }
          },
          platform: "youtube",
          color: this.getColor(message.author_details?.display_name),
          username: message.author_details?.display_name,
          sender: message.author_details?.display_name,
          id: message.id,
          senderId: message.author_details?.channel_id,
          isCommand: message.author_details?.display_name === "Talking Bot",
          isFirst: false,
          isOld: false,
        });
        break;
    }
  }
}
