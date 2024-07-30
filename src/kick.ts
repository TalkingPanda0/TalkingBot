import { Platform, Poll, TalkingBot } from "./talkingbot";
import DOMPurify from "isomorphic-dompurify";
import { KickCommandData } from "./commands";
import OTP from "otp";
import { ChannelInstance, Events, Kient } from "kient";

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

interface Auth {
  username: string;
  pass: string;
  otp: string;
}
const channelSlug = "sweetbabooo-o";

export class Kick {
  public currentPoll: Poll;
  public isConnected: boolean = false;

  private authFile = Bun.file(__dirname + "/../config/kick.json");
  private otp: OTP;
  private client: Kient;
  private channel: ChannelInstance;

  private bot: TalkingBot;

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  private log(message: any) {
    console.log("\x1b[32m%s\x1b[0m", message);
  }

  public cleanUp() {
    this.client.ws.chatroom.disconnect(this.channel.data.chatroom.id);
  }

  public async banUser(userName: string, duration: number) {
    try {
      await this.client.api.chat.banUser(
        this.channel.data.user.username,
        userName,
        duration,
      );
    } catch (e) {
      console.error(e);
    }
  }

  public async initBot() {
    try {
      const auth: Auth = await this.authFile.json();
      this.otp = OTP.parse(auth.otp);

      this.client = await Kient.create();
      await this.client.api.authentication.login({
        email: auth.username,
        password: auth.pass,
        otc: this.otp.totp(Date.now()),
      });

      this.channel = await this.client.api.channel.getChannel(channelSlug);
      this.client.on(Events.Chatroom.Message, async (message) => {
        const badges = ["https://kick.com/favicon.ico"];
        const text = message.data.content;
        const commandName = message.data.content.split(" ")[0];

        this.log(`Kick - ${message.data.sender.username}: ${text}`);
        message.data.sender.identity.badges.forEach(
          (element: { type: string }) => {
            if (element.type === "moderator") {
              badges.push("/kickmod.svg");
            } else if (element.type === "subscriber") {
              badges.push("/kicksub.svg");
            }
          },
        );
        const data: KickCommandData = {
          message: text.replace(commandName, ""),
          user: message.data.sender.username,
          reply: (response, replyToUser) => {
            this.client.api.chat.sendMessage(
              this.channel.data.chatroom.id,
              response,
              replyToUser
                ? {
                    senderId: message.data.sender.id,
                    messageId: message.data.id,
                    messageContent: message.data.content,
                    senderUsername: message.data.sender.username,
                  }
                : null,
            );
          },
          platform: Platform.kick,
          isUserMod:
            message.chatterIs("broadcaster") || message.chatterIs("moderator"),
          userColor: message.data.sender.identity.color,
          context: message,
        };

        const showOnChat = await this.bot.commandHandler.handleCommand(
          commandName,
          data,
        );

        if (!showOnChat) return;
        this.bot.iochat.emit("message", {
          text: await this.bot.parseClips(
            parseKickEmotes(DOMPurify.sanitize(text)),
          ),
          sender: message.data.sender.username,
          senderId: "kick-" + message.data.sender.id,
          badges: badges,
          color: message.data.sender.identity.color,
          id: "kick-" + message.data.id,
          platform: "kick",
          isFirst: false,
          replyTo: "",
          replyId: "",
        });
      });

      this.client.on(Events.Chatroom.UserBanned, (event) => {
        this.bot.iochat.emit("banUser", `kick-${event.data.user.id}`);
      });
      this.client.on(Events.Chatroom.MessageDeleted, (event) => {
        this.bot.iochat.emit("deleteMessage", "kick-" + event.getMessageId());
      });
      this.client.on(Events.Chatroom.PollDeleted, () => {
        this.bot.twitch.apiClient.polls.endPoll(
          this.bot.twitch.channel.id,
          this.bot.twitch.currentPoll.id,
          false,
        );
        this.bot.iopoll.emit("deletePoll");
      });
      this.client.on(Events.Chatroom.PollUpdated, async (event) => {
        this.currentPoll = {
          title: event.data.poll.title,
          options: event.data.poll.options.map((option) => {
            return {
              votes: option.votes,
              label: option.label,
              id: option.id.toString(),
            };
          }),
        };
        if (
          event.data.poll.options.some((e) => {
            return e.votes != 0;
          })
        ) {
          this.bot.updatePoll();
          return;
        }

        setTimeout(() => {
          this.currentPoll = null;
        }, event.data.poll.duration * 1000);
        const options: string[] = event.data.poll.options.map(
          (item: { label: string }) => item.label,
        );

        await this.bot.twitch.apiClient.polls.createPoll(
          this.bot.twitch.channel.id,
          {
            title: event.data.poll.title,
            duration: event.data.poll.duration,
            choices: options,
          },
        );
        this.bot.twitch.currentPoll = this.currentPoll;
        this.bot.iopoll.emit("createPoll", this.currentPoll);
      });
      this.client.on(Events.Chatroom.ClearChat, () => {
        this.bot.iochat.emit("clearChat", "kick");
      });

      this.client.on(Events.Chatroom.Subscription, (event) => {
        this.bot.ioalert.emit("alert", {
          name: event.data.username,
          message: "",
          plan: "",
          months: event.data.months,
          gift: false,
        });
      });
      this.client.on(Events.Chatroom.SubscriptionsGifted, (event) => {
        event.data.gifted_usernames.forEach((gifted) => {
          this.bot.ioalert.emit("alert", {
            name: event.data.gifter_username,
            gifted: gifted,
            message: "",
            plan: "",
            months: 1,
            gift: true,
          });
        });
      });
      this.client.on(Events.Channel.FollowersUpdate, (event) => {
        if (!event.data.followed || event.data.username == null) return;
        this.bot.ioalert.emit("alert", {
          follower: event.data.username,
        });
      });

      this.client.on(Events.Core.WebSocketConnected, () => {
        this.log("Kick setup complete");
      });

      await this.client.ws.chatroom.listen(this.channel.data.chatroom.id);
    } catch (e) {
      console.error(e);
    }
  }
}
