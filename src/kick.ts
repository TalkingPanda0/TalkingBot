import WebSocket from "ws";
import { Command, Platform, Poll, TalkingBot } from "./talkingbot";

export class Kick {
  public currentPoll: Poll;
  private channelId: string;
  private bot: TalkingBot;

  constructor(channelId: string, bot: TalkingBot) {
    this.channelId = channelId;
    this.bot = bot;
  }

  public initBot() {
    const chat = new WebSocket(
      "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false",
    );
    chat.on("open", () => {
      chat.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: { auth: "", channel: `chatrooms.${this.channelId}.v2` },
        }),
      );

      console.log("\x1b[32m%s\x1b[0m", "Kick Setup Complete");
    });

    chat.on("error", console.error);

    chat.on("close", () => {
      console.log("Connection closed for chatroom: " + this.channelId);
    });

    chat.on("message", (data: WebSocket.Data) => {
      try {
        const badges = ["https://kick.com/favicon.ico"];
        const dataString = data.toString();
        const jsonData = JSON.parse(dataString);
        const jsonDataSub = JSON.parse(jsonData.data);

        switch (jsonData.event) {
          case "App\\Events\\ChatMessageEvent":
            const text = jsonDataSub.content
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            const user = jsonDataSub.sender.username;

            const userBadges = jsonDataSub.sender.identity.badges;

            if (user === "BotRix") return;

            let firstBadgeType = "";
            if (userBadges.length != 0) {
              firstBadgeType = userBadges[0].type;
              const jsonBadges = jsonDataSub.sender.identity.badges;

              jsonBadges.forEach((element: { type: string }) => {
                if (element.type === "moderator") {
                  badges.push("/static/kickmod.svg");
                } else if (element.type === "subscriber") {
                  badges.push("/static/kicksub.svg");
                }
              });
            }

            console.log(
              "\x1b[32m%s\x1b[0m",
              `Kick - ${jsonDataSub.sender.username}: ${text}`,
            );
            if (!text.startsWith("!")) {
              this.bot.iochat.emit("message", {
                text: this.parseEmotes(text),
                sender: jsonDataSub.sender.username,
                senderId: jsonDataSub.sender.id,
                badges: badges,
                color: jsonDataSub.sender.identity.color,
                id: "kick-" + jsonDataSub.id,
                platform: "kick",
                isFirst: false,
              });
              return;
            }

            for (let i = 0; i < this.bot.commandList.length; i++) {
              let command = this.bot.commandList[i];
              if (!text.startsWith(command.command)) continue;

              command.commandFunction(
                user,
                firstBadgeType === "moderator" ||
                  firstBadgeType === "broadcaster",
                text.replace(command.command, "").trim(),
                (message: string, replyToUser: boolean) => {
                  // Can't reply on kick yet
                },
                Platform.kick,
              );
              if (!command.showOnChat) return;
              this.bot.iochat.emit("message", {
                text: this.parseEmotes(text),
                sender: jsonDataSub.sender.username,
                senderId: jsonDataSub.sender.id,
                badges: badges,
                color: jsonDataSub.sender.identity.color,
                id: "kick-" + jsonDataSub.id,
                platform: "kick",
                isFirst: false,
              });
            }
            break;
          case "App\\Events\\MessageDeletedEvent":
            this.bot.iochat.emit(
              "messageDelete",
              "kick-" + jsonDataSub.message.id,
            );
            break;
          case "App\\Events\\ChatroomClearEvent":
            this.bot.iochat.emit("clearChat", "kick");
            break;
          case "App\\Events\\UserBannedEvent":
            this.bot.iochat.emit("banUser", jsonDataSub.user.id);
            break;
          case "App\\Events\\PollUpdateEvent":
            this.currentPoll = jsonDataSub.poll;
            if (jsonDataSub.poll.duration != jsonDataSub.poll.remaining) {
              this.bot.updatePoll();
              break;
            }

            setTimeout(() => {
              this.currentPoll = null;
            }, jsonDataSub.poll.duration * 1000);
            const options: string[] = jsonDataSub.poll.options.map(
              (item: { label: string }) => item.label,
            );

            /*this.bot.twitch.apiClient.polls.createPoll(
              this.bot.twitch.channel.id,
              {
                title: jsonDataSub.poll.title,
                duration: jsonDataSub.poll.duration,
                choices: options,
              },
            );*/
            this.bot.iopoll.emit("createPoll", jsonDataSub.poll);
            break;
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
  private parseEmotes(message: string) {
    const regex = /\[emote:(\d+):([^\]]+)\]/g;
    return message.replace(
      regex,
      (match, id, name) =>
        `<img src="https://files.kick.com/emotes/${id}/fullsize" class="emote" />`,
    );
  }
}
