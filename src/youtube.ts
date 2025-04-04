import { TalkingBot } from "./talkingbot";
import { LiveChat } from "youtube-chat";
import { userColors } from "./twitch";
import { YouTubeAPI } from "./youtubeapi";
import { MessageItem } from "youtube-chat/dist/types/data";

export function parseYTMessage(
  message: MessageItem[],
  emojisasImg: boolean,
): string {
  return message
    .map((item) => {
      return "text" in item
        ? item.text
        : emojisasImg
          ? `<img onload="emoteLoaded()" src="${item.url}" class="emote" />`
          : item.alt;
    })
    .join(" ");
}

export class YouTube {
  public isConnected: boolean = false;
  public api: YouTubeAPI;
  public permTitle: string;

  private bot: TalkingBot;
  private chat: LiveChat;
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

  public cleanUp() {
    this.chat.stop();
  }

  public onStreamEnd() {
    if (this.permTitle) this.api.setTitle(this.permTitle);
    this.api.onStreamEnd();
  }

  public initBot() {
    this.api.setupAPI();

    this.chat.on("end", () => {
      this.bot.iochat.emit("chatDisconnect", "youtube");
      this.isConnected = false;
      console.log("\x1b[31m%s\x1b[0m", `Youtube disconnected`);
    });

    this.chat.on("start", async (videoId) => {
      this.bot.iochat.emit("chatConnect", "youtube");
      this.isConnected = true;
      this.api.getChatId(videoId);
      console.log("\x1b[31m%s\x1b[0m", `Youtube setup complete: ${videoId}`);
      const title = await this.bot.twitch.getCurrentTitle();
      if (title != null) this.api.setTitle(title);
    });

    this.chat.on("error", (erro) => {
      console.log(erro);
    });

    this.chat.on("chat", async (event) => {
      try {
        let text = parseYTMessage(event.message, false);
        console.log(
          "\x1b[31m%s\x1b[0m",
          `YouTube - ${event.author.name}: ${text}`,
        );

        const badges = [];
        if (event.isModerator) {
          badges.push("/ytmod.svg");
        }
        this.bot.commandHandler.handleMessage({
          badges: badges,
          isUserMod: event.isModerator || event.isOwner,
          reply: async (message, _replyToUser) => {
            try {
              await this.api.sendMessage(message);
            } catch (e) {
              console.error(e);
            }
          },
          message: text,
          parsedMessage: parseYTMessage(event.message, true),
          banUser: async (_reason, duration) => {
            try {
              this.api.banUser(event.author.channelId, duration);
            } catch (e) {
              console.error(e);
            }
          },
          platform: "youtube",
          color: this.getColor(event.author.name),
          username: event.author.name,
          sender: event.author.name,
          id: event.id,
          senderId: event.author.channelId,
          isFirst: false,
          replyText: "",
          replyId: "",
          replyTo: "",
          rewardName: "",
          isOld: false,
          isCommand:
            event.author.name === "BotRix" ||
            event.author.name == "Talking Bot",
        });

        return;
      } catch (e) {
        console.log(e);
      }
    });
    this.chat.start();
  }
  constructor(channelName: string, bot: TalkingBot) {
    this.bot = bot;

    this.chat = new LiveChat({ channelId: channelName });
    this.api = new YouTubeAPI();
  }
}
