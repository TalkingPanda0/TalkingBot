import { TubeChat } from "tubechat";
import { TalkingBot, Platform } from "./talkingbot";
import { userColors } from "./twitch";
import { MessageFragments } from "tubechat/lib/types/Client";
import { CommandData } from "./commands";
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

  public async initBot() {
    this.api.setupAPI();
    this.chat.connect(this.channelName);

    this.chat.on("disconnect", () => {
      this.bot.iochat.emit("chatDisconnect", "YouTube");
      this.isConnected = false;
      this.videoId = null;
      console.log("\x1b[31m%s\x1b[0m", `Youtube disconnected`);
    });

    this.chat.on("chat_connected", (channel, videoId) => {
      this.bot.iochat.emit("chatConnect", "YouTube");
      this.isConnected = true;
      this.videoId = videoId;
      this.api.getChatId(videoId);
      console.log("\x1b[31m%s\x1b[0m", `Youtube setup complete: ${videoId}`);
    });

    this.chat.on(
      "message",
      async ({ color, id, isModerator, isOwner, message, name }) => {
        try {
          let text = message
            .map((messageFragment) => {
              return messageFragment.text;
            })
            .join("");
          const isMod = isModerator || isOwner;
          //if (text == null) return;
          if (name === "BotRix") return;
          console.log("\x1b[31m%s\x1b[0m", `YouTube - ${name}: ${text}`);

          const badges = ["https://www.youtube.com/favicon.ico"];
          if (isModerator) {
            badges.push("/ytmod.svg");
          }

          if (text === undefined || !text.startsWith("!")) {
            // not a command!
            color = this.getColor(name);
            this.bot.iochat.emit("message", {
              badges: badges,
              text: parseYTMessage(message),
              sender: name,
              senderId: "youtube",
              color: color,
              id: "youtube-" + id,
              platform: "youtube",
              isFirst: false,
              replyTo: "",
              replyId: "",
            });
            return;
          }
          const commandName = text.split(" ")[0];
          const data: CommandData = {
            user: name,
            userColor: this.getColor(name),
            isUserMod: isMod,
            message: text.replace(commandName, "").trim(),
            platform: Platform.youtube,
            context: message,
            reply: (message: string, replyToUser: boolean) => {
              this.api.sendMessage(message);
            },
          };
          const showOnChat = await this.bot.commandHandler.handleCommand(
            commandName,
            data,
          );
          if (showOnChat) {
            color = this.getColor(name);
            this.bot.iochat.emit("message", {
              badges: ["https://www.youtube.com/favicon.ico"],
              text: parseYTMessage(message),
              sender: name,
              senderId: "youtube",
              color: color,
              id: "youtube-" + id,
              platform: "youtube",
              isFirst: false,
              replyTo: "",
              replyId: "",
            });
          }

          return;
        } catch (e) {
          console.log(e);
        }
      },
    );
  }
  constructor(channelName: string, bot: TalkingBot) {
    this.channelName = channelName;
    this.bot = bot;

    this.chat = new TubeChat();
    this.api = new YouTubeAPI();
  }
}
