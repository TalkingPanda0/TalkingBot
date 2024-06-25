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
  parseChatMessage,
  ParsedMessagePart,
  buildEmoteImageUrl,
  parseTwitchMessage,
} from "@twurple/chat";
import { ApiClient, HelixUser } from "@twurple/api";

import { EventSubWsListener } from "@twurple/eventsub-ws";
import {
  EventSubChannelRedemptionAddEvent,
  EventSubChannelFollowEvent,
  EventSubChannelPollProgressEvent,
  EventSubStreamOnlineEvent,
  EventSubChannelPollEndEvent,
  EventSubChannelCheerEvent,
} from "@twurple/eventsub-base";
import {
  AuthSetup,
  Platform,
  Poll,
  TalkingBot,
  getSuffix,
  pollOption,
  replaceAsync,
} from "./talkingbot";
import DOMPurify from "isomorphic-dompurify";
import { BunFile } from "bun";

const pollRegex = /^(.*?):\s*(.*)$/;

export const userColors = [
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

export function parseTwitchEmotes(
  text: string,
  emoteOffsets: Map<string, string[]>,
): string {
  let parsed = "";
  const parsedParts = parseChatMessage(text, emoteOffsets);
  parsedParts.forEach((parsedPart: ParsedMessagePart) => {
    switch (parsedPart.type) {
      case "text":
        parsed += DOMPurify.sanitize(parsedPart.text);
        break;
      case "cheer":
        const cheermoteUrl = `https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/${parsedPart.amount}/4.gif`;
        parsed += `<img src="${cheermoteUrl}" class="emote"">`;
        break;
      case "emote":
        const emoteUrl = buildEmoteImageUrl(parsedPart.id, {
          size: "3.0",
          backgroundType: "dark",
          animationSettings: "default",
        });
        parsed += ` <img src="${emoteUrl}" class="emote" id="${parsedPart.id}"> `;
        break;
    }
  });

  return parsed;
}

export class Twitch {
  public clientId: string = "";
  public clientSecret: string = "";
  public apiClient: ApiClient;
  public channel: HelixUser;
  public currentPoll: Poll;
  public chatClient: ChatClient;
  public redeemQueue: EventSubChannelRedemptionAddEvent[] = [];
  public clipRegex = /(?:https:\/\/)?clips\.twitch\.tv\/(\S+)/;
  public wwwclipRegex = /(?:https:\/\/)?www\.twitch\.tv\/\S+\/clip\/([^\s?]+)/;

  private channelName: string;
  private eventListener: EventSubWsListener;
  private bot: TalkingBot;
  private authProvider: RefreshingAuthProvider;
  private badges: Map<string, string> = new Map<string, string>();
  private pollid = "10309d95-f819-4f8e-8605-3db808eff351";
  private titleid = "cddfc228-5c5d-4d4f-bd54-313743b5fd0a";
  private timeoutid = "a86f1b48-9779-49c1-b4a1-42534f95ec3c";
  private shieldid = "9a3d1045-a42b-4cb0-b5eb-7e850b4984ec";
  private wheelid = "ec1b5ebb-54cd-4ab1-b0fd-3cd642e53d64";
  private selftimeoutid = "8071db78-306e-46e8-a77b-47c9cc9b34b3";
  private oauthFile: BunFile = Bun.file(__dirname + "/../config/oauth.json");
  private broadcasterFile: BunFile = Bun.file(
    __dirname + "/../config/token-broadcaster.json",
  );
  private botFile: BunFile = Bun.file(__dirname + "/../config/token-bot.json");

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  getUserColor(message: ChatMessage): string {
    let color = message.userInfo.color;

    // User hasn't set a color or failed to get the color get a "random" color
    if (!color) {
      color = userColors[parseInt(message.userInfo.userId) % userColors.length];
    }

    return color;
  }

  async sendToChatList(
    message: ChatMessage,
    isCommand: Boolean,
    isOld: Boolean,
  ): Promise<void> {
    let color = message.userInfo.color;
    let badges = ["https://twitch.tv/favicon.ico"];
    let replyTo = "";
    let replyId = "";
    let text = parseTwitchEmotes(message.text, message.emoteOffsets);
    let rewardName = "";

    text = await this.bot.parseClips(text);
    if (message.userInfo.isMod) {
      badges.push(this.badges.get("moderator"));
    } else if (message.userInfo.isBroadcaster) {
      badges.push(this.badges.get("broadcaster"));
    }

    const badge = message.userInfo.badges.get("subscriber");
    if (badge != undefined) {
      badges.push(this.badges.get(badge));
    }

    color = this.getUserColor(message);

    if (message.isReply) {
      text = text.replace(
        new RegExp(`@${message.parentMessageUserDisplayName}`, "i"),
        "",
      );
      replyTo = message.parentMessageUserDisplayName;
      replyId = message.parentMessageUserId;
    }

    if (message.isHighlight) {
      rewardName = "Highlight My Message";
    }

    if (message.isRedemption) {
      console.log("redmep");
      const reward = await this.apiClient.channelPoints.getCustomRewardById(
        this.channel.id,
        message.rewardId,
      );
      rewardName = reward.title;
    }

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
      isCommand: isCommand,
      rewardName: rewardName,
      isOld: isOld,
    });
  }
  public cleanUp() {
    this.chatClient.quit();
    this.eventListener.stop();
  }

  public updateShieldReedem(status: boolean) {
    this.apiClient.channelPoints.updateCustomReward(
      this.channel.id,
      this.shieldid,
      { isPaused: status },
    );
  }

  public setupAuth(auth: AuthSetup) {
    this.clientId = auth.twitchClientId;
    this.clientSecret = auth.twitchClientSecret;
    this.channelName = auth.channelName;

    Bun.write(
      this.oauthFile,
      JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        channelName: this.channelName,
      }),
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
    Bun.write(
      isBroadcaster ? this.broadcasterFile : this.botFile,
      JSON.stringify(tokenData, null, 4),
    );
  }

  public async readAuth() {
    const fileContent = await this.oauthFile.json();
    this.clientId = fileContent.clientId;
    this.clientSecret = fileContent.clientSecret;
    this.channelName = fileContent.channelName;
  }

  async initBot(): Promise<void> {
    await this.readAuth();
    this.authProvider = new RefreshingAuthProvider({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: "http://localhost:3000/oauth",
    });

    this.authProvider.onRefresh(async (userId, newTokenData) => {
      let isBroadcaster: Boolean =
        newTokenData.scope[0].startsWith("bits:read");
      Bun.write(
        isBroadcaster ? this.broadcasterFile : this.botFile,
        JSON.stringify(newTokenData, null, 4),
      );
    });

    await this.authProvider.addUserForToken(await this.botFile.json(), [
      "chat",
    ]);
    await this.authProvider.addUserForToken(await this.broadcasterFile.json(), [
      "",
    ]);

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
    this.eventListener.onStreamOnline(
      this.channel.id,
      async (event: EventSubStreamOnlineEvent) => {
        this.bot.pet.init(true);
        try {
          const stream = await event.getStream();
          const thumbnail = stream.getThumbnailUrl(1280, 720);
          this.bot.discord.sendStreamPing({
            title: stream.title,
            game: stream.gameName,
            thumbnailUrl: thumbnail,
          });
        } catch (e) {
          console.error(
            "\x1b[35m%s\x1b[0m",
            `Failed getting stream info: ${e}`,
          );
          this.bot.discord.sendStreamPing();
        }
      },
    );

    this.eventListener.onStreamOffline(this.channel.id, (event) => {
      this.bot.pet.sleep();
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

    this.eventListener.onUserSocketDisconnect((event) => {
      console.error(`Disconnected from event sub ${event}`);
    });

    this.eventListener.onChannelPollBegin(this.channel.id, (data) => {
      if (this.currentPoll != null) return;
      const pollOptions: pollOption[] = data.choices.reduce(
        (options, choice, index) => {
          const option: pollOption = {
            id: index.toString(),
            label: choice.title,
            votes: 0,
          };
          options.push(option);
          return options;
        },
        [],
      );

      this.currentPoll = {
        title: data.title,
        options: pollOptions,
      };

      this.bot.iopoll.emit("createPoll", {
        duration: 60,
        options: pollOptions,
        title: data.title,
      });
    });

    this.eventListener.onChannelPollProgress(
      this.channel.id,
      (data: EventSubChannelPollProgressEvent) => {
        const options: pollOption[] = [];
        data.choices.forEach((choice, i) => {
          options.push({
            label: choice.title,
            id: i.toString(),
            votes: choice.totalVotes,
          });
        });
        this.currentPoll = { title: data.title, options: options, id: data.id };
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
          if (data.input === "") {
            this.bot.iochat.emit("redeem", {
              id: data.id,
              user: data.userDisplayName,
              title: data.rewardTitle,
            });
          }
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
            case this.shieldid:
              completed = this.bot.pet.activateShield();
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
          console.error("\x1b[35m%s\x1b[0m", `Failed handling redeem: ${e}`);
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

    this.eventListener.onChannelBan(this.channel.id, (event) => {
      this.bot.iochat.emit("banUser", `twitch-${event.userId}`);
      this.chatClient.say(
        this.channelName,
        `@${event.userName} has been banished to the nut room${event.isPermanent ? " Forever." : "."}`,
      );
    });

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
          if (user === "botrixoficial") return;

          console.log(
            "\x1b[35m%s\x1b[0m",
            `Twitch - ${msg.userInfo.displayName}: ${text}`,
          );

          // not a command
          if (!text.startsWith("!")) {
            this.sendToChatList(msg, false, false);
            return;
          }
          this.sendToChatList(msg, true, false);
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
            command.commandFunction({
              user: name,
              userColor: this.getUserColor(msg),
              isUserMod: isMod,
              platform: Platform.twitch,
              message: text.replace(command.command, "").trim(),
              reply: (message: string, replyToUser: boolean) => {
                const replyId = replyToUser ? msg.id : null;
                this.chatClient.say(channel, message, { replyTo: replyId });
                this.bot.iochat.emit("message", {
                  badges: [this.badges.get("moderator")],
                  text: message,
                  sender: "TalkingBotO_o",
                  senderId: "twitch-" + "bot",
                  color: "#008000",
                  id: undefined,
                  platform: "twitch",
                  isFirst: false,
                  replyTo: replyToUser ? name : "",
                  replyId: "twitch-" + msg.userInfo.userId,
                  isCommand: true,
                });
              },
              context: msg,
            });

            if (command.showOnChat) this.sendToChatList(msg, false, false);
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
            this.bot.iochat.emit("message", {
              badges: [this.badges.get("moderator")],
              text: response,
              sender: "TalkingBotO_o",
              senderId: "twitch-" + "bot",
              color: "#008000",
              id: undefined,
              platform: "twitch",
              isFirst: false,
              replyTo: doReply ? name : "",
              replyId: "twitch-" + msg.userInfo.userId,
              isCommand: true,
            });
          }
        } catch (e) {
          console.error("\x1b[35m%s\x1b[0m", `Failed handling message: ${e}`);
        }
      },
    );

    this.chatClient.onConnect(() => {
      console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
      if (this.bot.connectedtoOverlay) {
        this.bot.iochat.emit("chatConnect", "Twitch");
        this.sendRecentMessages();
      }
    });
    this.chatClient.onDisconnect((manually: boolean, reason?: Error) => {
      this.bot.iochat.emit("chatDisconnect", "Twitch");
      console.error(
        "\x1b[35m%s\x1b[0m",
        `Disconnected from twitch, trying to reconnect: ${reason}, ${manually}`,
      );
      this.chatClient.reconnect();
    });
    this.chatClient.connect();
    this.eventListener.start();
    // Apis ready
  }
  public say(message: string) {
    this.chatClient.say(this.channel.name, message);
    this.bot.iochat.emit("message", {
      badges: [this.badges.get("moderator")],
      text: message,
      sender: "TalkingBotO_o",
      senderId: "twitch-" + "bot",
      color: "#008000",
      id: undefined,
      platform: "twitch",
      isFirst: false,
      replyTo: "",
      replyId: "",
      isCommand: false,
    });
  }
  public async handleRedeemQueue(accept?: Boolean) {
    try {
      const redeem = this.redeemQueue.shift();
      if (accept) {
        switch (redeem.rewardId) {
          case this.pollid:
            const matches = redeem.input.match(pollRegex);
            if (matches) {
              const question = matches[1];
              const options = matches[2]
                .split(",")
                .map((word: string) => word.trim());
              const poll = await this.apiClient.polls.createPoll(
                this.channel.id,
                {
                  title: question,
                  duration: 60,
                  choices: options,
                },
              );
              this.chatClient.say(
                this.channelName,
                `Created poll: ${redeem.input} requested by @${redeem.userName}`,
              );
            } else {
              this.chatClient.say(
                this.channelName,
                `@${redeem.userDisplayName} Couldn't parse poll: ${redeem.input}`,
              );
              accept = false;
            }
            break;
          case this.titleid:
            const currentInfo =
              await this.apiClient.channels.getChannelInfoById(this.channel.id);
            await this.apiClient.channels.updateChannelInfo(this.channel.id, {
              title: redeem.input,
            });
            this.chatClient.say(
              this.channelName,
              `Changed title to: ${redeem.input} requested by @${redeem.userName}`,
            );
            setTimeout(
              () => {
                this.apiClient.channels.updateChannelInfo(this.channel.id, {
                  title: currentInfo.title,
                });
                this.chatClient.say(
                  this.channelName,
                  `Changed title back to: ${currentInfo.title}`,
                );
              },
              15 * 60 * 1000,
            );
            break;
        }
      } else if (accept === null) {
        // scam
        accept = true;
      }
      await this.apiClient.channelPoints.updateRedemptionStatusByIds(
        this.channel.id,
        redeem.rewardId,
        [redeem.id],
        accept ? "FULFILLED" : "CANCELED",
      );
    } catch (e) {
      console.error("\x1b[35m%s\x1b[0m", `Failed handling redeem queue: ${e}`);
    }
  }
  public async sendRecentMessages() {
    const url = `https://recent-messages.robotty.de/api/v2/recent-messages/${this.channelName.toLowerCase()}?hide_moderation_messages=true&hide_moderated_messages=true&limit=20`;
    const recentMessages = JSON.parse(await (await fetch(url)).text());
    recentMessages.messages.forEach((element: string) => {
      try {
        if (!element.includes("PRIVMSG")) return;
        const message = parseTwitchMessage(element) as ChatMessage;
        if (message.userInfo.userName === "botrixoficial") return;

        // find a better way to get bot's id
        const isCommand =
          message.text.startsWith("!") ||
          message.userInfo.userId === "736013381";

        this.sendToChatList(message, isCommand, true);
      } catch (e) {
        console.error(
          "\x1b[35m%s\x1b[0m",
          `Failed parsing message ${element} : ${e}`,
        );
      }
    });
  }
}
