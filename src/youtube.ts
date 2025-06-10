import { TubeChat } from "tubechat";
import { TalkingBot } from "./talkingbot";
import { userColors } from "./twitch";
import { MessageFragments } from "tubechat/lib/types/Client";
import { YouTubeAPI } from "./youtubeapi";
export function parseYTMessage(message: MessageFragments[]): string {
  let text = "";
  message.some((fragment) => {
    if (fragment.text !== undefined) {
      text += fragment.text;
    } else if (fragment.emoji !== undefined) {
      text += `<img onload="emoteLoaded()" src="${fragment.emoji}" class="emote" />`;
    }
  });
  return text;
}

export class YouTube {
  public isConnected: boolean = false;
  public api: YouTubeAPI;
  public permTitle: string | null = null;

  private bot: TalkingBot;
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
    this.api.onStreamEnd();
  }

  public async initBot() {
    this.api.setupAPI();
    this.chat.connect(this.channelName);

    this.chat.on("disconnect", () => {
      this.bot.iochat.emit("chatDisconnect", "youtube");
      this.isConnected = false;
      console.log("\x1b[31m%s\x1b[0m", `Youtube disconnected`);
    });

    this.chat.on("chat_connected", async (_channel, videoId) => {
      this.bot.iochat.emit("chatConnect", "youtube");
      this.isConnected = true;
      this.api.getChatId(videoId);
      console.log("\x1b[31m%s\x1b[0m", `Youtube setup complete: ${videoId}`);
      const title = await this.bot.twitch.getCurrentTitle();
      if (title != null) this.api.setTitle(title);
    });

    this.chat.on("message", async (event) => {
      try {
        let text = event.message
          .map((messageFragment) => {
            if (messageFragment.textEmoji) return messageFragment.textEmoji;
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
          reply: async (message, _replyToUser) => {
            try {
              await this.api.sendMessage(message);
            } catch (e) {
              console.error(e);
            }
          },
          message: text,
          parsedMessage: parseYTMessage(event.message),
          banUser: async (_reason, duration) => {
            try {
              this.api.banUser(event.channelId, duration);
            } catch (e) {
              console.error(e);
            }
          },
          platform: "youtube",
          color: this.getColor(event.name),
          username: event.channel,
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
      const e = event as unknown as { externalChannelId: string | null }; // nothing weird going on here.
      if (!e.externalChannelId) {
        return;
      }
      this.bot.iochat.emit("banUser", `youtube-${e.externalChannelId}`);
    });

    this.chat.on("unkown", (event) => {
      console.log("unknwoı event: " + JSON.stringify(event));
    });
  }
  constructor(channelName: string, bot: TalkingBot) {
    this.channelName = channelName;
    this.bot = bot;

    this.chat = new TubeChat();
    this.api = new YouTubeAPI();
  }
}
