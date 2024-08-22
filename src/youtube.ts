import { TubeChat } from "tubechat";
import { TalkingBot } from "./talkingbot";
import { userColors } from "./twitch";
import { MessageFragments } from "tubechat/lib/types/Client";
import { YouTubeAPI } from "./youtubeapi";
export function parseYTMessage(message: MessageFragments[]): string {
  let text = "";
  for (let i = 0; i < message.length; i++) {
    const fragment: MessageFragments = message.at(i);
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
  public api: YouTubeAPI;
  public permTitle: string;

  private bot: TalkingBot;
  private videoId: string;
  private chat: TubeChat;
  private channelName: string;
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
    this.chat.disconnect(this.channelName);
  }

  public onStreamEnd() {
    if (this.permTitle) this.api.setTitle(this.permTitle);
  }

  public async initBot() {
    this.api.setupAPI();
    this.chat.connect(this.channelName);

    this.chat.on("disconnect", () => {
      this.bot.iochat.emit("chatDisconnect", "youtube");
      this.isConnected = false;
      this.videoId = null;
      console.log("\x1b[31m%s\x1b[0m", `Youtube disconnected`);
    });

    this.chat.on("chat_connected", (channel, videoId) => {
      this.bot.iochat.emit("chatConnect", "youtube");
      this.isConnected = true;
      this.videoId = videoId;
      this.api.getChatId(videoId);
      console.log("\x1b[31m%s\x1b[0m", `Youtube setup complete: ${videoId}`);
    });

    this.chat.on("message", async (event) => {
      try {
        let text = event.message
          .map((messageFragment) => {
            return messageFragment.text;
          })
          .join("");
        console.log("\x1b[31m%s\x1b[0m", `YouTube - ${event.name}: ${text}`);

        const badges = [];
        if (event.isModerator) {
          badges.push("/ytmod.svg");
        }
        this.bot.commandHandler.handleMessage({
          badges: badges,
          isUserMod: event.isModerator || event.isOwner,
          reply: async (message, replyToUser) => {
            try {
              await this.api.sendMessage(message);
            } catch (e) {
              console.error(e);
            }
          },
          message: text,
          parsedMessage: parseYTMessage(event.message),
          banUser: async (reason, duration) => {
            try {
              this.api.banUser(event.channelId, duration);
            } catch (e) {
              console.error(e);
            }
          },
          platform: "youtube",
          color: this.getColor(event.name),
          sender: event.name,
          id: event.id,
          senderId: event.channelId,
          isFirst: false,
          replyText: "",
          replyId: "",
          replyTo: "",
          rewardName: "",
          isOld: false,
          isCommand: event.name === "BotRix" || event.name == "Talking Bot",
        });

        return;
      } catch (e) {
        console.log(e);
      }
    });

    this.chat.on("deleted_message", (event) => {
      this.bot.iochat.emit("deleteMessage", "youtube-" + event.commentId);
    });

    this.chat.on("deleted_message_author", (event) => {
      this.bot.iochat.emit("banUser", `youtube-${event.externalChannelId}`);
    });

    this.chat.on("unkown", (event) => {
      console.log("unknwoı event: " + event);
    });
  }
  constructor(channelName: string, bot: TalkingBot) {
    this.channelName = channelName;
    this.bot = bot;

    this.chat = new TubeChat();
    this.api = new YouTubeAPI();
  }
}
