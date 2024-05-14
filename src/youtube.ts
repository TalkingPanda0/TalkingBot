import { TubeChat } from "tubechat";
import { TalkingBot, Platform } from "./talkingbot";
import { userColors } from "./twitch";
import {  MessageFragments } from "tubechat/lib/types/Client";
export class YouTube {
	public isConnected: boolean  = false;

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
  private parseMessage(message: MessageFragments[]): string {
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

  public async initBot() {
    this.chat.connect(this.channelName);

    this.chat.on("disconnect",() => {
      this.bot.iochat.emit("chatDisconnect",{color:"#FF0000",name:"YouTube"});
			this.isConnected = false;
    });

    this.chat.on("chat_connected", (channel, videoId) => {
      this.bot.iochat.emit("chatConnect",{name:"YouTube"});
			this.isConnected = true;
      console.log("\x1b[31m%s\x1b[0m", `Youtube setup complete: ${videoId}`);
    });

    this.chat.on(
      "message",
      async ({
        badges,
        channel,
        channelId,
        color,
        id,
        isMembership,
        isModerator,
        isNewMember,
        isOwner,
        isVerified,
        message,
        name,
        thumbnail,
        timestamp,
      }) => {
        try {
          let text = message.at(0).text;
          const isMod = isModerator || isOwner;
          //if (text == null) return;
          if (name === "BotRix") return;
          console.log("\x1b[31m%s\x1b[0m", `YouTube - ${name}: ${text}`);

          if (text === undefined || !text.startsWith("!")) {
            // not a command!
            color = this.getColor(name);
            this.bot.iochat.emit("message", {
              badges: ["https://www.youtube.com/favicon.ico"],
              text: this.parseMessage(message),
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
          let commandName = text.split(" ")[0];
          for (let i = 0; i < this.bot.aliasCommands.length; i++) {
            const alias = this.bot.aliasCommands[i];
            if (commandName != alias.alias) continue;
            text = text.replace(alias.alias, alias.command);
            commandName = alias.command;
          }

          for (let i = 0; i < this.bot.commandList.length; i++) {
            const command = this.bot.commandList[i];
            if (commandName != command.command) continue;

            command.commandFunction(
              name,
              isMod,
              text.replace(command.command, "").trim(),
              (message: string, replyToUser: boolean) => {
                // can't
              },
              Platform.youtube,
            );
            if (command.showOnChat) {
              color = this.getColor(name);
              this.bot.iochat.emit("message", {
                badges: ["https://www.youtube.com/favicon.ico"],
                text: this.parseMessage(message),
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
          }
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
  }
}
