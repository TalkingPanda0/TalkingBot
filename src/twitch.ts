import { RefreshingAuthProvider, exchangeCode } from "@twurple/auth";
import {
  ChatClient,
  ChatMessage,
  ChatSubInfo,
  ChatRaidInfo,
  ClearChat,
  ClearMsg,
  UserNotice,
  ChatSubGiftInfo,
} from "@twurple/chat";
import {
  ApiClient,
  HelixChannelUpdate,
  HelixCreateCustomRewardData,
  HelixCustomRewardRedemption,
  HelixUser,
} from "@twurple/api";
import {
  AuthSetup,
  Command,
  Platform,
  Poll,
  TalkingBot,
  getSuffix,
  pollOption,
  replaceAsync,
} from "./talkingbot";
import * as fs from "fs";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import {
  EventSubChannelRedemptionAddEvent,
  EventSubChannelBanEvent,
  EventSubChannelFollowEvent,
  EventSubChannelPollProgressEvent,
  EventSubChannelPollEndEvent,
  EventSubChannelCheerEvent,
} from "@twurple/eventsub-base";

// Get the tokens from ../tokens.json
const oauthPath = "oauth.json";
const botPath = "token-bot.json";
const broadcasterPath = "token-broadcaster.json";
const pollRegex = /^(.*?):\s*(.*)$/;
const userColors = [
  "#ff0000",
  "#0000ff",
  "#b22222",
  "#ff7f50",
  "#9acd32",
  "#ff4500",
  "#2e8b57",
  "#daa520",
  "#d2691e",
  "#5f9ea0",
  "#1e90ff",
  "#ff69b4",
  "#8a2be2",
  "#00ff7f",
];

export class Twitch {
  public clientId: string = "";
  public clientSecret: string = "";
  public apiClient: ApiClient;
  public channel: HelixUser;
  public eventListener: EventSubWsListener;
  public currentPoll: Poll;
  public chatClient: ChatClient;
  public rewardData: HelixCreateCustomRewardData;
  public redeemQueue: EventSubChannelRedemptionAddEvent[] = [];
  private channelName: string;
  private bot: TalkingBot;
  private authProvider: RefreshingAuthProvider;
  private badges: Map<string, string> = new Map<string, string>();
  private pollid = "10309d95-f819-4f8e-8605-3db808eff351";
  private titleid = "cddfc228-5c5d-4d4f-bd54-313743b5fd0a";
  private timeoutid = "a86f1b48-9779-49c1-b4a1-42534f95ec3c";
  private wheelid = "ec1b5ebb-54cd-4ab1-b0fd-3cd642e53d64";
  private selftimeoutid = "8071db78-306e-46e8-a77b-47c9cc9b34b3";

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }
  async sendToChatList(message: ChatMessage): Promise<void> {
    let color = message.userInfo.color;
    let badges = ["https://twitch.tv/favicon.ico"];
    let replyTo = "";
    let replyId = "";

    const badge = message.userInfo.badges.get("subscriber");
    if (badge != undefined) {
      badges.push(this.badges.get(badge));
    }
    if (message.userInfo.isMod) {
      badges.push(this.badges.get("moderator"));
    } else if (message.userInfo.isBroadcaster) {
      badges.push(this.badges.get("broadcaster"));
    }

    // User hasn't set a color get a "random" color
    if (color === null || color === undefined) {
      color = userColors[parseInt(message.userInfo.userId) % userColors.length];
    }

    let text = message.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (message.isReply) {
      text = text.replace(
        new RegExp(`@${message.parentMessageUserDisplayName}`, "i"),
        "",
      );
      replyTo = message.parentMessageUserDisplayName;
      replyId = message.parentMessageUserId;
    }

    let emotes: Map<string, string> = new Map<string, string>();

    message.emoteOffsets.forEach((offsets: string[], emote: string) => {
      let startIndex = parseInt(offsets[0]);
      let endIndex =
        parseInt(offsets[0].slice(offsets[0].indexOf("-") + 1)) + 1;
      let emoteString = text.slice(startIndex, endIndex);
      emotes.set(
        emoteString,
        `https://static-cdn.jtvnw.net/emoticons/v2/${emote}/default/dark/3.0`,
      );
    });
    emotes.forEach((emoteUrl: string, emote: string) => {
      text = text.replace(
        new RegExp(emote.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g"),
        `<img src=${emoteUrl} class="emote" />`,
      );
    });

    this.bot.iochat.emit("message", {
      badges: badges,
      text: text,
      sender: message.userInfo.displayName,
      senderId: "twitch-" + message.userInfo.userId,
      color: color,
      id: "twitch-" + message.id,
      platform: "twitch",
      isFirst: message.isFirst,
      replyTo: replyTo,
      replyId: "twitch-" + replyId,
    });
  }

  public setupAuth(auth: AuthSetup) {
    this.clientId = auth.twitchClientId;
    this.clientSecret = auth.twitchClientSecret;
    this.channelName = auth.channelName;

    fs.writeFileSync(
      oauthPath,
      JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        channelName: this.channelName,
      }),
      "utf-8",
    );

    this.authProvider = new RefreshingAuthProvider({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: "http://localhost:3000/oauth",
    });
  }

  public async addUser(code: string, scope: string) {
    const isBroadcaster: Boolean = scope.startsWith("bits:read");
    const tokenData = await exchangeCode(
      this.clientId,
      this.clientSecret,
      code,
      "http://localhost:3000/oauth",
    );
    fs.writeFileSync(
      isBroadcaster ? broadcasterPath : botPath,
      JSON.stringify(tokenData, null, 4),
      "utf-8",
    );
  }

  public readAuth() {
    const fileContent = JSON.parse(fs.readFileSync(oauthPath, "utf-8"));
    this.clientId = fileContent.clientId;
    this.clientSecret = fileContent.clientSecret;
    this.channelName = fileContent.channelName;
  }

  async initBot(): Promise<void> {
    this.authProvider = new RefreshingAuthProvider({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: "http://localhost:3000/oauth",
    });

    this.authProvider.onRefresh(async (userId, newTokenData) => {
      let isBroadcaster: Boolean =
        newTokenData.scope[0].startsWith("bits:read");
      fs.writeFileSync(
        isBroadcaster ? broadcasterPath : botPath,
        JSON.stringify(newTokenData, null, 4),
        "utf-8",
      );
    });

    await this.authProvider.addUserForToken(
      JSON.parse(fs.readFileSync(botPath, "utf-8")),
      ["chat"],
    );
    await this.authProvider.addUserForToken(
      JSON.parse(fs.readFileSync(broadcasterPath, "utf-8")),
      [""],
    );

    this.apiClient = new ApiClient({ authProvider: this.authProvider });

    this.channel = await this.apiClient.users.getUserByName(this.channelName);

    const channelBadges = await this.apiClient.chat.getChannelBadges(
      this.channel.id,
    );
    channelBadges.forEach((badge) => {
      if (badge.id !== "subscriber") return;
      badge.versions.forEach((element) => {
        this.badges.set(element.id, element.getImageUrl(4));
      });
    });
    const globalBadges = await this.apiClient.chat.getGlobalBadges();
    globalBadges.forEach((badge) => {
      if (badge.id != "moderator" && badge.id != "broadcaster") return;
      badge.versions.forEach((element) => {
        this.badges.set(badge.id, element.getImageUrl(4));
      });
    });

    this.eventListener = new EventSubWsListener({
      apiClient: this.apiClient,
    });
    this.eventListener.onChannelFollow(
      this.channel.id,
      this.channel.id,
      (event: EventSubChannelFollowEvent) => {
        this.bot.ioalert.emit("alert", {
          follower: event.userDisplayName,
        });
      },
    );
    this.eventListener.onChannelPollProgress(
      this.channel.id,
      (data: EventSubChannelPollProgressEvent) => {
        let options: pollOption[] = [];
        data.choices.forEach((choice, i) => {
          options.push({
            label: choice.title,
            id: i.toString(),
            votes: choice.totalVotes,
          });
        });
        this.currentPoll = { title: data.title, options: options };
        this.bot.updatePoll();
      },
    );
    this.eventListener.onChannelPollEnd(
      this.channel.id,
      (data: EventSubChannelPollEndEvent) => {
        this.currentPoll = null;
      },
    );
    this.eventListener.onChannelRedemptionAdd(
      this.channel.id,
      async (data: EventSubChannelRedemptionAddEvent) => {
        try {
          console.log(
            `Got redemption ${data.userDisplayName} - ${data.rewardTitle}: ${data.input} ${data.rewardId}`,
          );
          let completed: Boolean;
          switch (data.rewardId) {
            case this.selftimeoutid:
              const modlist = await this.apiClient.moderation.getModerators(
                this.channel.id,
                { userId: data.userId },
              );
              if (modlist.data.length == 1) {
                completed = false;
                break;
              }
              this.apiClient.moderation.banUser(this.channel.id, {
                duration: 300,
                reason: "Self Timeout Request",
                user: data.userId,
              });
              completed = true;
              break;
            case this.timeoutid:
              const username = data.input.split(" ")[0].replace("@", "");
              const user: HelixUser =
                await this.apiClient.users.getUserByName(username);

              if (user == null || user.id == data.broadcasterId) {
                completed = false;
                this.chatClient.say(
                  this.channelName,
                  `@${data.userDisplayName} Couldn't timeout user: ${data.input}`,
                );
                break;
              }
              const mods = await this.apiClient.moderation.getModerators(
                this.channel.id,
                { userId: user.id },
              );
              if (mods.data.length == 1) {
                completed = false;
                this.chatClient.say(
                  this.channelName,
                  `@${data.userDisplayName} Couldn't timeout user: ${data.input}`,
                );
                break;
              }
              this.apiClient.moderation.banUser(this.channel.id, {
                duration: 60,
                reason: `Timeout request by ${data.userDisplayName}`,
                user: user.id,
              });
              completed = true;
              break;
            case this.pollid:
              // message like Which is better?: hapboo, realboo, habpoo, hapflat
              this.redeemQueue.push(data);
              break;
            case this.titleid:
              this.redeemQueue.push(data);
              break;
            default:
              return;
          }
          if (completed == null) return;
          this.apiClient.channelPoints.updateRedemptionStatusByIds(
            this.channel.id,
            data.rewardId,
            [data.id],
            completed ? "FULFILLED" : "CANCELED",
          );
        } catch (e) {
          console.log(e);
        }
      },
    );

    this.eventListener.onChannelCheer(
      this.channel.id,
      (event: EventSubChannelCheerEvent) => {
        this.bot.ioalert.emit("alert", {
          bits: event.bits,
          user: event.userDisplayName,
          message: event.message,
        });
      },
    );
    this.chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [this.channelName],
    });
    this.chatClient.onSub(
      (
        channel: string,
        user: string,
        subInfo: ChatSubInfo,
        msg: UserNotice,
      ) => {
        this.bot.ioalert.emit("alert", {
          name: subInfo.displayName,
          message: subInfo.message,
          plan: subInfo.plan,
          months: subInfo.months,
          gift: false,
        });
      },
    );
    this.chatClient.onSubGift(
      (
        channel: string,
        user: string,
        subInfo: ChatSubGiftInfo,
        msg: UserNotice,
      ) => {
        this.bot.ioalert.emit("alert", {
          name: subInfo.gifter,
          gifted: subInfo.displayName,
          message: subInfo.message,
          plan: subInfo.plan,
          months: subInfo.months,
          gift: true,
        });
      },
    );

    this.chatClient.onRaid(
      (
        channel: string,
        user: string,
        raidInfo: ChatRaidInfo,
        msg: UserNotice,
      ) => {
        this.bot.ioalert.emit("alert", {
          raider: raidInfo.displayName,
          viewers: raidInfo.viewerCount,
        });
      },
    );
    this.chatClient.onBan((channel: string, user: string, msg: ClearChat) => {
      this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
      this.chatClient.say(
        this.channelName,
        `@${user} has been banished to the nut room.`,
      );
    });
    this.chatClient.onTimeout(
      (channel: string, user: string, duration: number, msg: ClearChat) => {
        this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
        this.chatClient.say(
          this.channelName,
          `@${user} has been banished to the nut room.`,
        );
      },
    );
    this.chatClient.onMessageRemove(
      (channel: string, messageId: string, msg: ClearMsg) => {
        this.bot.iochat.emit("deleteMessage", "twitch-" + messageId);
      },
    );
    this.chatClient.onChatClear((channel: string, msg: ClearChat) => {
      this.bot.iochat.emit("clearChat", "twitch");
    });
    this.chatClient.onMessage(
      async (channel: string, user: string, text: string, msg: ChatMessage) => {
        try {
          text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          if (user === "botrixoficial") return;

          console.log(
            "\x1b[35m%s\x1b[0m",
            `Twitch - ${msg.userInfo.displayName}: ${text}`,
          );

          // not a command
          if (!text.startsWith("!")) {
            this.sendToChatList(msg);
            return;
          }
          const name = msg.userInfo.displayName;
          const isMod = msg.userInfo.isMod || msg.userInfo.isBroadcaster;
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
                this.chatClient.say(channel, message, {
                  replyTo: replyToUser ? msg.id : null,
                });
              },
              Platform.twitch,
              msg,
            );
            if (command.showOnChat) this.sendToChatList(msg);
            return;
          }
          for (let i = 0; i < this.bot.customCommands.length; i++) {
            const command = this.bot.customCommands[i];
            if (commandName != command.command) continue;
            const message = text.replace(command.command, "").trim();
            const modonly = command.response.includes("(modonly)");
            const doReply = command.response.includes("(reply)");
            let response = (
              await replaceAsync(
                command.response,
                /(!?fetch)\[([^]+)\]{?(\w+)?}?/g,

                async (
                  message: string,
                  command: string,
                  url: string,
                  key: string,
                ) => {
                  url = url
                    .replace(/\$user/g, name)
                    .replace(/\$args/g, message);
                  const req = await fetch(url);
                  if (command.startsWith("!")) return "";
                  if (key === undefined) {
                    return await req.text();
                  } else {
                    const json = await req.json();
                    return json[key];
                  }
                },
              )
            )
              .replace(
                /suffix\((\d+)\)/g,
                (message: string, number: string) => {
                  return getSuffix(parseInt(number));
                },
              )
              .replace(/\$user/g, name)
              .replace(/\$args/g, message)
              .replace(/\(modonly\)/g, "")
              .replace(/\(reply\)/g, "");

            if (modonly && !isMod) return;
            this.chatClient.say(channel, response, {
              replyTo: doReply ? msg.id : null,
            });
          }
        } catch (e) {
          console.log(e);
        }
      },
    );

    this.chatClient.onConnect(() => {
      console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
    });

    this.chatClient.connect();
    this.eventListener.start();
  }
  public async handleRedeemQueue(accept?: Boolean) {
    const redeem = this.redeemQueue.shift();
    if (accept != null) {
      switch (redeem.rewardId) {
        case this.pollid:
          const matches = redeem.input.match(pollRegex);
          if (matches) {
            const question = matches[1];
            const options = matches[2]
              .split(",")
              .map((word: string) => word.trim());
            this.apiClient.polls.createPoll(this.channel.id, {
              title: question,
              duration: 60,
              choices: options,
            });
          } else {
            this.chatClient.say(
              this.channelName,
              `@${redeem.userDisplayName} Couldn't parse poll: ${redeem.input}`,
            );
            accept = false;
          }
          break;
        case this.titleid:
          const currentInfo = await this.apiClient.channels.getChannelInfoById(
            this.channel.id,
          );
          await this.apiClient.channels.updateChannelInfo(this.channel.id, {
            title: redeem.input,
          });
          setTimeout(
            () => {
              this.apiClient.channels.updateChannelInfo(this.channel.id, {
                title: currentInfo.title,
              });
            },
            15 * 60 * 1000,
          );
          break;
      }
    } else {
      // scam
      accept = true;
    }
    this.apiClient.channelPoints.updateRedemptionStatusByIds(
      this.channel.id,
      redeem.rewardId,
      [redeem.id],
      accept ? "FULFILLED" : "CANCELED",
    );
  }
}
