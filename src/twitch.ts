import { RefreshingAuthProvider, exchangeCode } from "@twurple/auth";
import {
  ChatClient,
  ChatMessage,
  ChatRaidInfo,
  ClearChat,
  ClearMsg,
  UserNotice,
  parseChatMessage,
  ParsedMessagePart,
  buildEmoteImageUrl,
} from "@twurple/chat";
import { ApiClient, HelixCheermoteList, HelixUser } from "@twurple/api";

import { EventSubWsListener } from "@twurple/eventsub-ws";
import {
  EventSubChannelRedemptionAddEvent,
  EventSubListener,
} from "@twurple/eventsub-base";
import { TalkingBot } from "./talkingbot";
import DOMPurify from "isomorphic-dompurify";
import { getBTTVEmotes } from "./bttv";
import { removeByIndexToUppercase, replaceMap } from "./util";
import {
  EventSubHttpListener,
  ReverseProxyAdapter,
} from "@twurple/eventsub-http";
import { CreditType } from "./credits";
import { PollOption } from "./poll";

import { updateCategory } from "./category";
import {
  getCheerAudio,
  getFollowAudio,
  getRaidAudio,
  getSubAudio,
} from "./alerts";

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

export class Twitch {
  public clientId = "";
  public clientSecret = "";
  public apiClient!: ApiClient;
  public channel!: HelixUser;
  public publicClientId!: string;
  public chatClient!: ChatClient;
  public redeemQueue: EventSubChannelRedemptionAddEvent[] = [];
  public clipRegex = /(?:https:\/\/)?clips\.twitch\.tv\/(\S+)/;
  public wwwclipRegex = /(?:https:\/\/)?www\.twitch\.tv\/\S+\/clip\/([^\s?]+)/;
  public isStreamOnline = false;
  public cheerEmotes!: HelixCheermoteList;
  public BTTVEmotes = new Map<string, string>();
  public badges = new Map<string, string>();

  private channelName!: string;
  private eventListener!: EventSubListener;
  private bot: TalkingBot;
  private authProvider!: RefreshingAuthProvider;
  private pollid = "10309d95-f819-4f8e-8605-3db808eff351";
  private titleid = "cddfc228-5c5d-4d4f-bd54-313743b5fd0a";
  private timeoutid = "a86f1b48-9779-49c1-b4a1-42534f95ec3c";
  //private wheelid = "ec1b5ebb-54cd-4ab1-b0fd-3cd642e53d64";
  private eventSubSecret?: string;
  private selftimeoutid = "8071db78-306e-46e8-a77b-47c9cc9b34b3";
  private oauthFile = Bun.file(__dirname + "/../config/oauth.json");
  private broadcasterFile = Bun.file(
    __dirname + "/../config/token-broadcaster.json",
  );
  private botFile = Bun.file(__dirname + "/../config/token-bot.json");
  private updateCategoryInterval: Timer | null = null;
  private sendTipReminderInterval: Timer | null = null;
  private allreadyFollowed: Set<string> = new Set();

  constructor(bot: TalkingBot) {
    this.bot = bot;
  }

  getUserColor(message: ChatMessage): string {
    let color = message.userInfo.color;

    // User hasn't set a color or failed to get the color, get a "random" color
    if (!color) {
      color = userColors[parseInt(message.userInfo.userId) % userColors.length];
    }

    return color;
  }

  public async cleanUp() {
    this.chatClient.quit();
    this.eventListener.stop();
    this.bot.database.updateDataBase(this.isStreamOnline ? 2 : 1);
    this.bot.database.cleanDataBase();
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
  // only things that should also run when the bot starts during a stream and on the start of stream.
  private async onStreamOnline() {
    this.updateCategoryInterval = setInterval(
      () => {
        updateCategory(this.bot);
      },
      5 * 60 * 1000,
    );

    this.sendTipReminderInterval = setInterval(
      () => {
        this.bot.broadcastMessage(
          `Buy me a food! https://ko-fi.com/sweetbaboo`,
        );
      },
      30 * 60 * 1000,
    );
  }
  private formatDisplayName(message: ChatMessage) {
    const display = message.userInfo.displayName;
    const login = message.userInfo.userName;
    if (display && display.toLowerCase().replaceAll(/\s/g, "") !== login) {
      return `${display} (${login})`;
    }
    return display || login;
  }

  public async readAuth() {
    const fileContent = await this.oauthFile.json();
    this.clientId = fileContent.clientId;
    this.clientSecret = fileContent.clientSecret;
    this.channelName = fileContent.channelName;
    this.publicClientId = fileContent.publicApikey;
    this.eventSubSecret = fileContent.eventSubSecret;
  }
  private async handleMessage(
    channel: string,
    user: string,
    text: string,
    msg: ChatMessage,
    isAction: boolean,
    isOld: boolean,
    isCommand: boolean = false,
  ) {
    try {
      console.log(
        "\x1b[35m%s\x1b[0m",
        `Twitch - ${this.formatDisplayName(msg)}: ${text}`,
      );

      let parsedMessage = await this.bot.parseClips(
        this.parseTwitchEmotes(msg.text, msg.emoteOffsets, msg.bits),
      );

      let badges = [];

      if (msg.userInfo.isMod) {
        badges.push(this.badges.get("moderator"));
      } else if (msg.userInfo.isBroadcaster) {
        badges.push(this.badges.get("broadcaster"));
      }

      if (msg.userInfo.isVip) badges.push(this.badges.get("vip"));

      const badge = msg.userInfo.badges.get("subscriber");
      if (badge != undefined) {
        badges.push(this.badges.get(badge));
      }
      let replyTo = null;
      let replyId = null;
      let replyText = null;
      let rewardName = null;
      if (msg.isReply) {
        parsedMessage = parsedMessage.replace(
          new RegExp(`^@${msg.parentMessageUserDisplayName}`, "i"),
          "",
        );
        replyTo = msg.parentMessageUserDisplayName;
        replyId = msg.parentMessageUserId;
        replyText = msg.parentMessageText;
      }

      if (msg.isHighlight) {
        rewardName = "Highlight My message";
      }

      if (msg.isRedemption && msg.rewardId) {
        const reward = await this.apiClient.channelPoints.getCustomRewardById(
          this.channel.id,
          msg.rewardId,
        );
        if (reward) rewardName = reward.title;
      }
      const indexes: number[] = [];
      msg.emoteOffsets.forEach((emote) => {
        emote.forEach((index) => {
          indexes.push(parseInt(index));
        });
      });
      const messageWithoutPrefix = removeByIndexToUppercase(text, indexes);
      if (msg.isCheer) {
        this.onCheer({
          bits: msg.bits,
          message: messageWithoutPrefix,
          userDisplayName: this.formatDisplayName(msg),
        });
      }

      const isUserMod = msg.userInfo.isMod || msg.userInfo.isBroadcaster;
      const isUserVip = isUserMod || msg.userInfo.isVip;
      const isUserSub = isUserVip || msg.userInfo.isSubscriber;

      this.bot.commandHandler.handleMessage({
        badges: badges.filter((s): s is string => !!s),
        username: msg.userInfo.userName,
        sender: this.formatDisplayName(msg),
        senderId: msg.userInfo.userId,
        color: this.getUserColor(msg),
        isUserMod: isUserMod,
        isUserSub: isUserSub,
        isUserVip: isUserVip,
        platform: "twitch",
        channelId: msg.channelId || "",
        message: messageWithoutPrefix,
        parsedMessage: parsedMessage,
        isFirst: msg.isFirst,
        replyText: replyText ?? undefined,
        replyId: replyId ?? undefined,
        replyTo: replyTo ?? undefined,
        rewardName: rewardName ?? undefined,
        isOld: isOld,
        isAction: isAction,
        isCommand:
          isCommand || user == "botrixoficial" || user == "talkingboto_o",
        id: msg.id,
        timestamp: msg.date,
        reply: isOld
          ? () => {}
          : async (message: string, replyToUser: boolean) => {
              if (!message || message == "") return;
              const replyId = replyToUser ? msg.id : undefined;
              await this.chatClient.say(channel, message, {
                replyTo: replyId,
              });
              this.bot.iochat.emit("message", {
                badges: [],
                text: message,
                parsedMessage: message,
                sender: "TalkingBot",
                senderId: "bot",
                color: "green",
                id: undefined,
                platform: "bot",
                isFirst: false,
                isCommand: true,
              });
              console.log(`TalkingBot - ${message}`);
            },
        banUser: async (message: string, duration?: number) => {
          try {
            await this.apiClient.moderation.banUser(this.channel.id, {
              user: msg.userInfo.userId,
              reason: message,
              duration: duration,
            });
          } catch (e) {
            console.error(e);
          }
        },
      });
    } catch (e) {
      console.error("\x1b[35m%s\x1b[0m", `Failed handling message: ${e}`);
    }
  }
  private async onCheer(event: {
    userDisplayName: string;
    bits: number;
    message: string;
  }) {
    this.bot.credits.addToCredits(event.userDisplayName, CreditType.Cheer);
    this.bot.ioalert.emit("alert", {
      audioList: await getCheerAudio(
        event.userDisplayName,
        event.bits,
        event.message,
      ),
      bits: event.bits,
      user: event.userDisplayName,
      message: event.message.replaceAll(/cheer\d+/gi, ""),
    });
  }

  async initBot(): Promise<void> {
    await this.readAuth();
    this.authProvider = new RefreshingAuthProvider({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: "http://localhost:3000/oauth",
    });

    this.authProvider.onRefresh(async (_userId, newTokenData) => {
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
    const channel = await this.apiClient.users.getUserByName(this.channelName);
    if (!channel) {
      console.error("failed getting channel.");
      return;
    }

    this.channel = channel;
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
      if (
        badge.id != "moderator" &&
        badge.id != "broadcaster" &&
        badge.id != "vip"
      )
        return;
      badge.versions.forEach((element) => {
        this.badges.set(badge.id, element.getImageUrl(4));
      });
    });
    this.cheerEmotes = await this.apiClient.bits.getCheermotes(this.channel.id);

    this.BTTVEmotes = await getBTTVEmotes(this.channel.id);

    if (this.eventSubSecret) {
      this.eventListener = new EventSubHttpListener({
        apiClient: this.apiClient,
        adapter: new ReverseProxyAdapter({
          hostName: "event.talkingpanda.dev",
          port: 8080,
        }),
        secret: this.eventSubSecret,
      });
    } else {
      console.log("No eventSubSecret found using ws.");
      this.eventListener = new EventSubWsListener({
        apiClient: this.apiClient,
      });
    }

    this.eventListener.onStreamOnline(this.channel.id, async (event) => {
      this.say("Something wicked this way comes.");
      this.isStreamOnline = true;
      this.bot.credits.clear();
      this.bot.whereWord.clearGame();
      try {
        const stream = await event.getStream();
        if (!stream) {
          throw Error("getStream returned null.");
        }
        const thumbnail = stream.getThumbnailUrl(1280, 720);
        await this.bot.discord.sendStreamPing({
          title: stream.title,
          game: stream.gameName,
          thumbnailUrl: thumbnail,
        });
        const chatters = await this.apiClient.chat.getChatters(this.channel.id);
        chatters.data.forEach((chatter) => {
          if (chatter.userId == "736013381" || chatter.userId == "646848961")
            return;
          this.bot.database.userLeave(chatter.userId, false);
          this.bot.database.userJoin(chatter.userId, true);
        });
      } catch (e) {
        console.error("\x1b[35m%s\x1b[0m", `Failed getting stream info: ${e}`);
        await this.bot.discord.sendStreamPing();
      }
      await this.onStreamOnline();
    });

    this.eventListener.onStreamOffline(this.channel.id, async (_event) => {
      this.isStreamOnline = false;
      this.chatClient.say(this.channelName, this.bot.whereWord.endGame());

      const chatters = await this.apiClient.chat.getChatters(this.channel.id);
      chatters.data.forEach((chatter) => {
        if (chatter.userId == "736013381" || chatter.userId == "646848961")
          return;
        this.bot.database.userLeave(chatter.userId, true);
        this.bot.database.userJoin(chatter.userId, false);
      });

      if (this.updateCategoryInterval)
        clearTimeout(this.updateCategoryInterval);
      if (this.sendTipReminderInterval)
        clearTimeout(this.sendTipReminderInterval);
    });

    this.eventListener.onChannelFollow(
      this.channel.id,
      this.channel.id,
      async (event) => {
        if (this.allreadyFollowed.has(event.userId)) return;
        this.bot.credits.addToCredits(event.userDisplayName, CreditType.Follow);
        this.bot.ioalert.emit("alert", {
          audioList: await getFollowAudio(event.userDisplayName),
          follower: event.userDisplayName,
        });
        this.allreadyFollowed.add(event.userId);
      },
    );

    if (!this.eventSubSecret) {
      const ws = this.eventListener as EventSubWsListener;
      ws.onUserSocketDisconnect((event) => {
        console.error(`Disconnected from event sub ${event}`);
      });
    } else {
      const httpListener: EventSubHttpListener = this
        .eventListener as EventSubHttpListener;
      httpListener.onSubscriptionCreateSuccess((subscription) => {
        console.log(`Succesfully subscribed to ${subscription._cliName}`);
      });
      httpListener.onSubscriptionCreateFailure((subscription, error) => {
        console.log(`Failed to connect to ${subscription._cliName}: ${error}`);
      });
    }

    this.eventListener.onChannelSubscription(this.channel.id, async (data) => {
      if ((data.tier as string) != "prime") return; // it can be prime, convert it to a string to supress the error.
      data.getUser().then((user) => {
        this.bot.setLatestSub({
          name: user.displayName,
          pfpUrl: user.profilePictureUrl,
          time: new Date(),
        });
      });
      this.bot.credits.addToCredits(
        data.userDisplayName,
        CreditType.Subscription,
      );
      this.bot.ioalert.emit("alert", {
        audioList: await getSubAudio(data.userDisplayName),
        messageAudioList: [],
        name: data.userDisplayName,
        message: "",
        plan: data.tier,
        months: 1,
        gift: false,
      });
    });

    this.eventListener.onChannelSubscriptionMessage(
      this.channel.id,
      async (data) => {
        data.getUser().then((user) => {
          this.bot.setLatestSub({
            name: user.displayName,
            pfpUrl: user.profilePictureUrl,
            time: new Date(),
          });
        });
        this.bot.credits.addToCredits(
          data.userDisplayName,
          CreditType.Subscription,
        );
        this.bot.ioalert.emit("alert", {
          audioList: await getSubAudio(data.userDisplayName),
          messageAudioList: await getSubAudio(data.messageText),
          name: data.userDisplayName,
          message: data.messageText,
          plan: data.tier,
          months: data.cumulativeMonths,
          gift: false,
        });
      },
    );
    this.eventListener.onChannelSubscriptionGift(
      this.channel.id,
      async (data) => {
        data.getGifter().then((user) => {
          this.bot.setLatestSub({
            name: user.displayName,
            pfpUrl: user.profilePictureUrl,
            time: new Date(),
          });
        });
        this.bot.credits.addToCredits(data.gifterName, CreditType.Subscription);
        this.bot.ioalert.emit("alert", {
          audioList: await getSubAudio(data.gifterName),
          messageAudioList: [],
          name: data.gifterName,
          gifted: data.amount,
          plan: data.tier,
          months: data.cumulativeAmount,
          gift: true,
        });
      },
    );

    this.eventListener.onChannelPollBegin(this.channel.id, (data) => {
      const pollOptions: PollOption[] = data.choices.reduce<PollOption[]>(
        (options, choice, index) => {
          const option: PollOption = {
            id: index,
            label: choice.title,
            score: 0,
          };
          options.push(option);
          return options;
        },
        [],
      );

      this.bot.iopoll.emit("createPoll", {
        duration: data.endDate.getTime() - data.startDate.getTime(),
        options: pollOptions,
        title: data.title,
      });
    });

    this.eventListener.onChannelPollProgress(this.channel.id, (data) => {
      const pollOptions: PollOption[] = data.choices.reduce<PollOption[]>(
        (options, choice, index) => {
          const option: PollOption = {
            id: index,
            label: choice.title,
            score: choice.totalVotes,
          };
          options.push(option);
          return options;
        },
        [],
      );
      this.bot.iopoll.emit("updatePoll", pollOptions);
    });

    this.eventListener.onChannelPollEnd(this.channel.id, (_data) => {
      this.bot.iopoll.emit("pollEnd");
    });

    this.eventListener.onChannelRedemptionAdd(this.channel.id, async (data) => {
      try {
        console.log(
          `Got redemption ${data.userDisplayName} - ${data.rewardTitle}: ${data.input} ${data.rewardId}`,
        );
        let completed: boolean | null = null;
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
            const user: HelixUser | null =
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
        console.error("\x1b[35m%s\x1b[0m", `Failed handling redeem: ${e}`);
      }
    });

    this.eventListener.onUserWhisperMessage("736013381", (data) => {
      if (data.messageText.startsWith("!vote")) {
        try {
          this.apiClient.whispers.sendWhisper(
            "736013381",
            data.senderUserId,
            this.bot.poll.addVote(
              `twitch-${data.senderUserDisplayName}`,
              data.messageText.replace("!vote ", ""),
            ),
          );
        } catch (error) {
          console.error(error);
        }
      }
    });

    this.chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [this.channelName],
      isAlwaysMod: true,
      requestMembershipEvents: true,
      ssl: true,
    });

    this.chatClient.onRaid(
      async (
        _channel: string,
        _user: string,
        raidInfo: ChatRaidInfo,
        _msg: UserNotice,
      ) => {
        this.bot.ioalert.emit("alert", {
          audioList: await getRaidAudio(
            raidInfo.displayName,
            raidInfo.viewerCount,
          ),
          raider: raidInfo.displayName,
          viewers: raidInfo.viewerCount,
        });
      },
    );

    this.chatClient.onJoin(async (_channel: string, user: string) => {
      if (
        user.toLowerCase() == "talkingboto_o" ||
        user.toLowerCase() == "botrixoficial"
      )
        return;
      console.log("\x1b[35m%s\x1b[0m", `Twitch - ${user} joined.`);

      const userInfo = await this.apiClient.users.getUserByName(user);
      if (!userInfo) {
        console.error(`Failed getting user ${user}.`);
        return;
      }
      this.bot.database.userJoin(userInfo.id, this.isStreamOnline);
    });

    this.chatClient.onPart(async (_channel: string, user: string) => {
      if (
        user.toLowerCase() == "talkingboto_o" ||
        user.toLowerCase() == "botrixoficial"
      )
        return;

      console.log("\x1b[35m%s\x1b[0m", `Twitch - ${user} left.`);

      const userInfo = await this.apiClient.users.getUserByName(user);
      if (!userInfo) {
        console.error(`Failed getting user ${user}.`);
        return;
      }
      this.bot.database.userLeave(userInfo.id, this.isStreamOnline);
    });

    this.eventListener.onChannelBan(this.channel.id, (event) => {
      if (event.isPermanent)
        this.bot.credits.deleteFromCredits(event.userDisplayName);
      this.bot.iochat.emit("banUser", `twitch-${event.userId}`);
      this.say(
        `@${event.userName} has been defenestrated${event.isPermanent ? " Forever" : ""}.`,
      );
    });

    this.chatClient.onMessageRemove(
      (_channel: string, messageId: string, _msg: ClearMsg) => {
        this.bot.iochat.emit("deleteMessage", "twitch-" + messageId);
      },
    );

    this.chatClient.onChatClear((_channel: string, _msg: ClearChat) => {
      this.bot.iochat.emit("clearChat", "twitch");
    });

    this.chatClient.onMessage(
      async (channel: string, user: string, text: string, msg: ChatMessage) => {
        this.handleMessage(channel, user, text, msg, false, false);
      },
    );

    this.chatClient.onAction((channel, user, text, msg) => {
      this.handleMessage(channel, user, text, msg, true, false);
    });

    this.chatClient.onConnect(() => {
      console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
      if (this.bot.connectedtoOverlay) {
        this.bot.iochat.emit("chatConnect", "Twitch");
      }
    });
    this.chatClient.onDisconnect((manually: boolean, reason?: Error) => {
      if (manually) return;
      this.bot.iochat.emit("chatDisconnect", "Twitch");
      console.error(
        "\x1b[35m%s\x1b[0m",
        `Disconnected from twitch, trying to reconnect: ${reason}, ${manually}`,
      );
    });
    this.chatClient.connect();
    this.eventListener.start();
    // Apis ready
    this.isStreamOnline = !!(await this.apiClient.streams.getStreamByUserId(
      this.channel.id,
    ));
    if (this.isStreamOnline) {
      this.onStreamOnline();
      this.say("AAAAAAAAAAAAAAA!");
    }
  }

  public async getCurrentTitle(): Promise<string | null> {
    const stream = await this.bot.twitch.apiClient.streams.getStreamByUserId(
      this.bot.twitch.channel.id,
    );

    if (stream == null) return null;
    return stream.title;
  }

  public async say(message: string) {
    if (!message || message == "") return;
    await this.chatClient.say(this.channel.name, message);
    this.bot.iochat.emit("message", {
      badges: [],
      text: message,
      parsedMessage: message,
      sender: "TalkingBot",
      senderId: "bot",
      color: "green",
      id: undefined,
      platform: "bot",
      isFirst: false,
      isCommand: true,
    });
  }

  public async handleRedeemQueue(accept?: Boolean) {
    try {
      const redeem = this.redeemQueue.shift();
      if (!redeem) return;
      if (accept) {
        switch (redeem.rewardId) {
          case this.pollid:
            const matches = redeem.input.match(pollRegex);
            if (matches) {
              const question = matches[1];
              const options = matches[2]
                .split(",")
                .map((word: string) => word.trim());
              await this.apiClient.polls.createPoll(this.channel.id, {
                title: question,
                duration: 60,
                choices: options.filter((value) => value != ""),
              });
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
            if (!currentInfo) {
              this.chatClient.say(
                this.channelName,
                `Failed getting current stream title.`,
              );
              return;
            }
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
  public parseTwitchEmotes(
    text: string,
    emoteOffsets: Map<string, string[]>,
    bits: number,
  ): string {
    let parsed = "";
    const parsedParts = parseChatMessage(
      text,
      emoteOffsets,
      this.cheerEmotes?.getPossibleNames(),
    );

    let cheerName = "";
    parsedParts.forEach((parsedPart: ParsedMessagePart) => {
      switch (parsedPart.type) {
        case "text":
          parsed += replaceMap(
            this.BTTVEmotes,
            DOMPurify.sanitize(parsedPart.text),
            (match: string) =>
              `<img onload="emoteLoaded()" src="https://cdn.betterttv.net/emote/${match}/1x" class="emote">`,
          );
          break;
        case "cheer":
          if (bits) cheerName = parsedPart.name;
          else parsed += `${parsedPart.name}${parsedPart.amount}`;
          break;
        case "emote":
          const emoteUrl = buildEmoteImageUrl(parsedPart.id, {
            size: "3.0",
            backgroundType: "dark",
            animationSettings: "default",
          });
          parsed += ` <img onload="emoteLoaded()" src="${emoteUrl}" class="emote" id="${parsedPart.id}"> `;
          break;
      }
    });
    if (!bits || this.cheerEmotes == null) return parsed;
    const cheermote = this.cheerEmotes.getCheermoteDisplayInfo(
      cheerName,
      bits,
      { background: "dark", state: "animated", scale: "4" },
    );
    parsed += `<img onload="emoteLoaded()" src="${cheermote.url}" class="emote"> <span style="color:${cheermote.color}">${bits} </span>`;

    return parsed;
  }
  public async sendStreamPing() {
    const stream =
      await this.apiClient.streams.getStreamByUserName("SweetbabooO_o");
    if (!stream) {
      console.error(`Stream is null.`);
      return;
    }
    const thumbnail = stream.getThumbnailUrl(1280, 720);
    await this.bot.discord.sendStreamPing({
      title: stream.title,
      game: stream.gameName,
      thumbnailUrl: thumbnail,
    });
  }
}
