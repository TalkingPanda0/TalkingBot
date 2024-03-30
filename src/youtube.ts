import { time } from "console";
import { TubeChat } from "tubechat";
import { TalkingBot, Platform } from "./talkingbot";
export class YouTube {
  private bot: TalkingBot;
  private chat: TubeChat;
  private channelName: string;
  public async initBot() {
    this.chat.connect(this.channelName);
    this.chat.on("chat_connected", (channel, videoId) => {
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
          if (text == null) return;
          if(name === "BotRix") return;
          console.log("\x1b[31m%s\x1b[0m", `YouTube - ${name}: ${text}`);

          if (!text.startsWith("!")) {
            // not a command!
            this.bot.iochat.emit("message", {
              badges: ["https://www.youtube.com/favicon.ico"],
              text: text,
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
              this.bot.iochat.emit("message", {
                badges: ["https://www.youtube.com/favicon.ico"],
                text: text,
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
