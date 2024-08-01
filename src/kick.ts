import WebSocket from "ws";
import { Poll, TalkingBot } from "./talkingbot";
import { HelixPoll } from "@twurple/api";
import DOMPurify from "isomorphic-dompurify";

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
interface ChatMessage {
  id: string;
  chatroom_id: number;
  content: string;
  type: string;
  created_at: Date;
  sender: {
    id: number;
    username: string;
    slug?: string;
    identity: {
      color: string;
      badges: Array<{
        type: string;
        text: string;
        count?: number;
      }>;
    };
  };
  metadata: {
    original_sender: {
      id: number;
      username: string;
    };
    original_message: {
      content: string;
    };
  };
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
      "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false",
    );
    this.chat.on("open", () => {
      this.chat.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: { auth: "", channel: `channel.17843348` },
        }),
      );
      this.chat.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: { auth: "", channel: `chatrooms.${this.channelId}.v2` },
        }),
      );
    });

    this.chat.on("error", console.error);

    this.chat.on("close", () => {
      this.bot.iochat.emit("chatDisconnect", "kick");
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
        const badges = [];
        const dataString = data.toString();
        const jsonData = JSON.parse(dataString);
        if (jsonData.event === "pusher:error") return;
        const jsonDataSub = JSON.parse(jsonData.data);
        switch (jsonData.event) {
          case "pusher_internal:subscription_succeeded":
            const channel: string = jsonData.channel;
            if (channel.startsWith("chatrooms")) {
              this.bot.iochat.emit("chatConnect", "kick");
              this.isConnected = true;
              console.log("\x1b[32m%s\x1b[0m", "Kick setup complete");
            } else {
              console.log("\x1b[32m%s\x1b[0m", "Connected to channel");
            }

            break;
          case "App\\Events\\ChatMessageEvent":
            const event: ChatMessage = jsonDataSub;
            const text = DOMPurify.sanitize(event.content);
            const userBadges = event.sender.identity.badges;

            let firstBadgeType = "";
            if (userBadges.length != 0) {
              firstBadgeType = userBadges[0].type;
              const jsonBadges = event.sender.identity.badges;

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
              `Kick - ${event.sender.username}: ${text}`,
            );
            let replyTo = "";
            let replyId = "";
            let replyText = "";
            // is a reply
            if (jsonDataSub.metadata != undefined) {
              replyTo = event.metadata.original_sender.username;
              replyId = event.metadata.original_sender.id.toString();
              replyText = event.metadata.original_message.content;
            }

            this.bot.commandHandler.handleMessage({
              badges: badges,
              message: removeKickEmotes(text),
              parsedMessage: parseKickEmotes(text),
              sender: event.sender.username,
              isCommand: event.sender.username == "BotRix",
              id: event.id,
              banUser: () => {},
              isOld: false,
              rewardName: "",
              replyTo: replyTo,
              replyId: replyId,
              replyText: replyText,
              isFirst: false,
              senderId: event.sender.id.toString(),
              color: event.sender.identity.color,
              platform: "kick",
              reply(message, replyToUser) {},
              isUserMod:
                firstBadgeType === "moderator" ||
                firstBadgeType === "broadcaster",
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
          case "App\\Events\\FollowersUpdated":
            if (!jsonDataSub.followed || jsonDataSub.username == null) return;
            this.bot.ioalert.emit("alert", {
              follower: jsonDataSub.username,
            });
          case "App\\Events\\ChannelSubscriptionEvent":
            this.bot.ioalert.emit("alert", {
              name: jsonDataSub.username,
              message: "",
              plan: "",
              months: jsonDataSub.months,
              gift: false,
            });
          case "App\\Events\\LuckyUsersWhoGotGiftSubscriptionsEvent":
            jsonDataSub.gifted_usernames.forEach((gifted: string) => {
              this.bot.ioalert.emit("alert", {
                name: jsonDataSub.gifter_username,
                gifted: gifted,
                message: "",
                plan: "",
                months: 1,
                gift: true,
              });
            });
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
