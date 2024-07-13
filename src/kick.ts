import WebSocket from "ws";
import { Platform, Poll, TalkingBot } from "./talkingbot";
import { HelixPoll } from "@twurple/api";
import DOMPurify from "isomorphic-dompurify";
import { CommandData } from "./commands";

const kickEmotePrefix = /sweetbabooo-o/g;

export function removeKickEmotes(message: string): string {
  const regex = /\[emote:(\d+):([^\]]+)\]/g;
  return message
    .replace(regex, (match, id, name) => {
      return name + " ";
    })
    .replace(kickEmotePrefix, "");
}

export function parseKickEmotes(message: string) {
  const regex = /\[emote:(\d+):([^\]]+)\]/g;
  return message.replace(
    regex,
    (match, id, name) =>
      `<img src="https://files.kick.com/emotes/${id}/fullsize" class="emote" />`,
  );
}

export class Kick {
  public currentPoll: Poll;
  public isConnected: boolean = false;

  private channelId: string;
  private bot: TalkingBot;
  private chat: WebSocket;

  constructor(channelId: string, bot: TalkingBot) {
    this.channelId = channelId;
    this.bot = bot;
  }

  public cleanUp() {
    this.chat.close();
  }

  public initBot() {
    this.chat = new WebSocket(
      "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false",
    );
    this.chat.on("open", () => {
      this.chat.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: { auth: "", channel: `chatrooms.${this.channelId}.v2` },
        }),
      );
    });

    this.chat.on("error", console.error);

    this.chat.on("close", () => {
      this.bot.iochat.emit("chatDisconnect", "Kick");
      this.isConnected = false;
      console.log(
        "\x1b[32m%s\x1b[0m",
        "Connection closed for chatroom, trying to reconnect...",
      );
      this.chat = null;
      setTimeout(() => this.initBot(), 10000);
    });

    this.chat.on("message", async (data: WebSocket.Data) => {
      try {
        const badges = ["https://kick.com/favicon.ico"];
        const dataString = data.toString();
        const jsonData = JSON.parse(dataString);
        if (jsonData.event === "pusher:error") return;
        const jsonDataSub = JSON.parse(jsonData.data);
        switch (jsonData.event) {
          case "pusher_internal:subscription_succeeded":
            this.bot.iochat.emit("chatConnect", "Kick");
            this.isConnected = true;
            console.log("\x1b[32m%s\x1b[0m", "Kick setup complete");
            break;
          case "App\\Events\\ChatMessageEvent":
            const text = DOMPurify.sanitize(jsonDataSub.content);
            const user = jsonDataSub.sender.username;

            const userBadges = jsonDataSub.sender.identity.badges;

            if (user === "BotRix") return;

            let firstBadgeType = "";
            if (userBadges.length != 0) {
              firstBadgeType = userBadges[0].type;
              const jsonBadges = jsonDataSub.sender.identity.badges;

              jsonBadges.forEach((element: { type: string }) => {
                if (element.type === "moderator") {
                  badges.push("/kickmod.svg");
                } else if (element.type === "subscriber") {
                  badges.push("/kicksub.svg");
                }
              });
            }

            console.log(
              "\x1b[32m%s\x1b[0m",
              `Kick - ${jsonDataSub.sender.username}: ${text}`,
            );
            let replyTo = "";
            let replyId = "";
            let replyText = "";
            // is a reply
            if (jsonDataSub.metadata != undefined) {
              replyTo = jsonDataSub.metadata.original_sender.username;
              replyId = jsonDataSub.metadata.original_sender.id;
							replyText = jsonDataSub.metadata.original_message.content;
            }
            if (!text.startsWith("!")) {
              this.bot.iochat.emit("message", {
                text: await this.bot.parseClips(parseKickEmotes(text)),
                sender: jsonDataSub.sender.username,
                senderId: "kick-" + jsonDataSub.sender.id,
                badges: badges,
                color: jsonDataSub.sender.identity.color,
                id: "kick-" + jsonDataSub.id,
                platform: "kick",
                isFirst: false,
                replyTo: replyTo,
                replyId: "kick-" + replyId,
								replyText: replyText,
              });
              return;
            }

            const commandName = text.split(" ")[0];
            const data: CommandData = {
              user: user,
              userColor: jsonDataSub.sender.identity.color,
              isUserMod:
                firstBadgeType === "moderator" ||
                firstBadgeType === "broadcaster",

              reply: (message: string, replyToUser: boolean) => {},
              platform: Platform.kick,
              message: text.replace(commandName, "").trim(),
            };
            const showOnChat = await this.bot.commandHandler.handleCommand(
              commandName,
              data,
            );

            if (!showOnChat) return;
            this.bot.iochat.emit("message", {
              text: await this.bot.parseClips(parseKickEmotes(text)),
              sender: jsonDataSub.sender.username,
              senderId: "kick-" + jsonDataSub.sender.id,
              badges: badges,
              color: jsonDataSub.sender.identity.color,
              id: "kick-" + jsonDataSub.id,
              platform: "kick",
              isFirst: false,
              replyTo: replyTo,
              replyId: "kick-" + replyId,
            });

            break;
          case "App\\Events\\MessageDeletedEvent":
            this.bot.iochat.emit(
              "deleteMessage",
              "kick-" + jsonDataSub.message.id,
            );
            break;
          case "App\\Events\\ChatroomClearEvent":
            this.bot.iochat.emit("clearChat", "kick");
            break;
          case "App\\Events\\UserBannedEvent":
            this.bot.iochat.emit("banUser", `kick-${jsonDataSub.user.id}`);
            break;
          case "App\\Events\\PollUpdateEvent":
            this.currentPoll = jsonDataSub.poll;
            if (
              jsonDataSub.poll.options.some((e) => {
                console.log(e);
                return e.votes != 0;
              })
            ) {
              this.bot.updatePoll();
              break;
            }

            setTimeout(() => {
              this.currentPoll = null;
            }, jsonDataSub.poll.duration * 1000);
            const options: string[] = jsonDataSub.poll.options.map(
              (item: { label: string }) => item.label,
            );

            const twitchPoll: HelixPoll =
              await this.bot.twitch.apiClient.polls.createPoll(
                this.bot.twitch.channel.id,
                {
                  title: jsonDataSub.poll.title,
                  duration: jsonDataSub.poll.duration,
                  choices: options,
                },
              );
            this.bot.twitch.currentPoll = {
              id: twitchPoll.id,
              options: jsonDataSub.poll.options,
              title: twitchPoll.title,
            };
            this.bot.iopoll.emit("createPoll", jsonDataSub.poll);
            break;
          case "App\\Events\\PollDeleteEvent":
            this.bot.twitch.apiClient.polls.endPoll(
              this.bot.twitch.channel.id,
              this.bot.twitch.currentPoll.id,
              false,
            );
            this.bot.iopoll.emit("deletePoll");
            break;
          /*default:
            console.log(dataString);
            break;*/
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
}
