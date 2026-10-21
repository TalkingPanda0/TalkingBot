import { RefreshingAuthProvider, exchangeCode } from "@twurple/auth";
import {
  ChatClient,
  ChatMessage,
  ChatRaidInfo,
  UserNotice,
  ChatViewerMilestoneInfo,
  ChatUser,
} from "@twurple/chat";
import { ApiClient, HelixCheermoteList, HelixUser } from "@twurple/api";

import { EventSubWsListener } from "@twurple/eventsub-ws";
import {
  EventSubChannelRedemptionAddEvent,
  EventSubListener,
} from "@twurple/eventsub-base";
import { TalkingBot } from "./talkingbot.ts";
import {
  colorFromId,
  formatDisplayName,
  getDisplayName,
  getUserColor,
  removeByIndexToUppercase,
} from "../shared/util.ts";
import {
  EventSubHttpListener,
  ReverseProxyAdapter,
} from "@twurple/eventsub-http";
import { CreditType } from "./credits.ts";

import { CONFIG } from "./env.ts";
import { ChannelPointReward, ChannelPointRewardStatus } from "botModule";
import {
  Clip,
  OverlayMessageData,
  PollEvent,
  PollOption,
} from "../shared/types.ts";

export class Twitch {
  public clientId;
  public clientSecret;
  public apiClient!: ApiClient;
  public channel!: HelixUser;
  public chatClient!: ChatClient;
  public redeemQueue: EventSubChannelRedemptionAddEvent[] = [];
  public clipRegex = /(?:https:\/\/)?clips\.twitch\.tv\/(\S+)/;
  public wwwclipRegex = /(?:https:\/\/)?www\.twitch\.tv\/\S+\/clip\/([^\s?]+)/;
  public isStreamOnline = false;
  public cheerEmotes!: HelixCheermoteList;
  public badges = new Map<string, string>();
  public currentGame: string | null = null;

  private channelName: string;
  private eventListener!: EventSubListener;
  private bot: TalkingBot;
  private authProvider!: RefreshingAuthProvider;
  private eventSubSecret?: string;
  private broadcasterFile = Bun.file(
    __dirname + "/../../config/token-broadcaster.json",
  );
  private botFile = Bun.file(__dirname + "/../../config/token-bot.json");
  private allreadyFollowed: Set<string> = new Set();

  constructor(bot: TalkingBot) {
    this.bot = bot;
    this.clientId = CONFIG.twitch.clientId;
    this.clientSecret = CONFIG.twitch.clientSecret;
    this.channelName = CONFIG.twitch.channelName;
    this.eventSubSecret = CONFIG.twitch.eventSubSecret;
  }

  public async cleanUp() {
    this.chatClient.quit();
    await this.apiClient.eventSub.deleteAllSubscriptions();
    this.eventListener.stop();
    this.bot.userManager.updateWatchTimes(this.isStreamOnline);
  }

  public async addUser(code: string, scope: string) {
    const isBroadcaster: boolean = scope.startsWith("bits:read");
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
    this.bot.onStreamOnline();
    this.isStreamOnline = true;
  }

  private async handleMessage(
    msg: ChatMessage,
    isAction: boolean,
    isCommand: boolean = false,
  ) {
    try {
      console.log(
        "\x1b[35m%s\x1b[0m",
        `Twitch - ${formatDisplayName(msg)}: ${msg.text}`,
      );

      let highlightMessage: string | null = null;
      let highlightColor: string | null = null;

      if (msg.isHighlight) {
        highlightColor = "#755ebc";
      } else if (msg.isRedemption && msg.rewardId) {
        const reward = await this.apiClient.channelPoints.getCustomRewardById(
          this.channel.id,
          msg.rewardId,
        );
        if (reward) {
          highlightMessage = `Redeemed ${reward.title} for ${reward.cost} Channel Points`;
          // Set alpha to 0.5
          highlightColor = reward.backgroundColor + "7f";
        }
      }

      if (msg.isFirst) {
        highlightColor = "rgba(176, 11, 105, 0.5)";
      }

      if (msg.isCheer) {
        this.onCheer(msg);
      }

      this.bot.commandHandler.handleMessage({
        badges: this.getBadges(msg.userInfo),
        displayName: formatDisplayName(msg),
        userId: msg.userInfo.userId,
        color: getUserColor(msg.userInfo),
        isUserMod: msg.userInfo.isMod,
        isUserSub: msg.userInfo.isSubscriber,
        isUserVip: msg.userInfo.isVip,
        platform: "twitch",
        message: msg.text,
        emoteOffsets: msg.tags.get("emotes") ?? "",
        isFirst: msg.isFirst,
        replyId: msg.parentMessageId,
        isAction: isAction,
        isCommand:
          isCommand ||
          msg.userInfo.userName == "botrixoficial" ||
          msg.userInfo.userName == "talkingboto_o",
        id: msg.id,
        timestamp: msg.date,
        highlightMessage,
        highlightColor,
        reply: async (message: string, replyToUser: boolean) => {
          if (!message || message == "") return;
          const replyId = replyToUser ? msg.id : undefined;
          await this.chatClient.say(this.channel.name, message, {
            replyTo: replyId,
          });
          let data: OverlayMessageData = {
            badges: [],
            message: message,
            displayName: "TalkingBot",
            userId: "bot",
            color: "green",
            platform: "bot",
            isCommand: true,
            replyId: null,
            emoteOffsets: null,
            highlightColor: null,
            highlightMessage: null,
            isAction: false,
            isFake: false,
            messageId: "",
            timestamp: new Date().getTime(),
          };
          this.bot.iochat.emit("message", data);
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
  private async onCheer(msg: ChatMessage) {
    const name = formatDisplayName(msg);

    this.bot.credits.addToCredits({
      userId: `twitch-${msg.userInfo.userId}`,
      userDisplayName: name,
      color: getUserColor(msg.userInfo),
      type: CreditType.Cheer,
    });

    const indexes: number[] = [];
    msg.emoteOffsets.forEach((emote) => {
      emote.forEach((index) => {
        indexes.push(parseInt(index));
      });
    });
    const messageWithoutPrefix = removeByIndexToUppercase(
      msg.text,
      indexes,
    ).replaceAll(/cheer\d+/gi, "");

    this.bot.alertsManager.bitsAlert(
      {
        type: "bitsAlert",
        bits: msg.bits,
        user: name,
        message: msg.text,
      },
      messageWithoutPrefix,
    );
  }

  async initBot(): Promise<void> {
    this.authProvider = new RefreshingAuthProvider({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: "http://localhost:3000/oauth",
    });

    this.authProvider.onRefresh(async (_userId, newTokenData) => {
      const isBroadcaster: boolean =
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
      try {
        const stream = await event.getStream();
        if (!stream) {
          throw Error("getStream returned null.");
        }
        const thumbnail = stream.getThumbnailUrl(1280, 720);
        this.currentGame = stream.gameId;
        await this.bot.discord.sendStreamPing({
          title: stream.title,
          game: stream.gameName,
          thumbnailUrl: thumbnail,
        });
        const chatters = await this.apiClient.chat.getChatters(this.channel.id);
        chatters.data.forEach((chatter) => {
          if (chatter.userId == "736013381" || chatter.userId == "646848961")
            return;
          this.bot.userManager.userLeave(
            chatter.userId,
            chatter.userDisplayName,
            false,
          );
          this.bot.userManager.userJoin(
            chatter.userId,
            chatter.userDisplayName,
            true,
          );
        });
      } catch (e) {
        console.error("\x1b[35m%s\x1b[0m", `Failed getting stream info: ${e}`);
        await this.bot.discord.sendStreamPing();
      }
      await this.onStreamOnline();
    });

    this.eventListener.onStreamOffline(this.channel.id, async () => {
      this.isStreamOnline = false;

      const chatters = await this.apiClient.chat.getChatters(this.channel.id);
      chatters.data.forEach((chatter) => {
        if (chatter.userId == "736013381" || chatter.userId == "646848961")
          return;
        this.bot.userManager.userLeave(
          chatter.userId,
          chatter.userDisplayName,
          true,
        );
        this.bot.userManager.userJoin(
          chatter.userId,
          chatter.userDisplayName,
          false,
        );
      });

      this.bot.onStreamOffline();
    });

    this.eventListener.onChannelFollow(
      this.channel.id,
      this.channel.id,
      async (event) => {
        if (this.allreadyFollowed.has(event.userId)) return;
        this.bot.credits.addToCredits({
          userId: `twitch-${event.userId}`,
          userDisplayName: getDisplayName(
            event.userDisplayName,
            event.userName,
          ),
          color: colorFromId(event.userId),
          type: CreditType.Follow,
        });
        this.bot.alertsManager.followAlert({
          type: "followAlert",
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

    this.eventListener.onChannelChatNotification(
      this.channel.id,
      "736013381",
      async (data) => {
        let months: number | null;
        let tier: string;
        let gift = false;
        let gifted = 0;

        switch (data.type) {
          case "sub":
            if (data.isPrime && data.durationMonths != 1) return;
            months = data.durationMonths;
            tier = data.tier;
            break;
          case "resub":
            if (data.isGift) return;
            months = data.cumulativeMonths;
            tier = data.tier;
            break;
          case "sub_gift":
            if (data.communityGiftId != null) return;
            months = data.durationMonths;
            gift = true;
            gifted = 1;
            tier = data.tier;
            break;
          case "community_sub_gift":
            months = data.cumulativeAmount;
            gift = true;
            gifted = data.amount;
            tier = data.tier;
            break;
          default:
            return;
        }

        const displayName = getDisplayName(
          data.chatterDisplayName,
          data.chatterName,
        );

        this.bot.alertsManager.subAlert(
          {
            type: "subAlert",
            name: displayName,
            message: data.messageText,
            plan: tier,
            months,
            gift,
            gifted,
          },
          data.messageText,
        );

        this.bot.credits.addToCredits({
          userId: `twitch-${data.chatterId}`,
          color: colorFromId(data.chatterId),
          userDisplayName: displayName,
          type: CreditType.Subscription,
        });

        const user = await data.getChatter();
        this.bot.setLatestSub({
          name: user.displayName,
          pfpUrl: user.profilePictureUrl,
          time: new Date(),
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

      const pollEvent: PollEvent = {
        duration: data.endDate.getTime() - data.startDate.getTime(),
        options: pollOptions,
        title: data.title,
      };

      this.bot.iopoll.emit("createPoll", pollEvent);
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

    this.eventListener.onChannelPollEnd(this.channel.id, () => {
      this.bot.iopoll.emit("pollEnd");
    });

    this.eventListener.onChannelRedemptionAdd(this.channel.id, async (data) => {
      console.log(
        `Got redemption ${data.userDisplayName} - ${data.rewardTitle}: ${data.input} ${data.rewardId}`,
      );
      if (data.input === "") {
        this.bot.iochat.emit("redeem", {
          id: data.id,
          user: data.userDisplayName,
          title: data.rewardTitle,
        });
      }
      this.bot.moduleManager.onChannelPointReward(data.rewardId, data);
    });

    this.chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [this.channelName],
      isAlwaysMod: true,
      requestMembershipEvents: true,
      ssl: true,
    });

    this.chatClient.onRaid(
      async (_channel: string, _user: string, raidInfo: ChatRaidInfo) => {
        this.bot.alertsManager.raidAlert({
          type: "raidAlert",
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
      this.bot.userManager.userJoin(
        userInfo.id,
        userInfo.displayName,
        this.isStreamOnline,
      );
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
      this.bot.userManager.userLeave(
        userInfo.id,
        userInfo.displayName,
        this.isStreamOnline,
      );
    });

    this.eventListener.onChannelBan(this.channel.id, (event) => {
      if (event.isPermanent)
        this.bot.credits.deleteFromCredits(event.userDisplayName);
      this.bot.iochat.emit("banUser", event.userId);
      this.say(
        `@${event.userName} has been defenestrated${event.isPermanent ? " Forever" : ""}.`,
      );
    });

    this.chatClient.onMessageRemove((_channel: string, messageId: string) => {
      this.bot.iochat.emit("deleteMessage", "twitch-" + messageId);
    });

    this.chatClient.onChatClear(() => {
      this.bot.iochat.emit("clearChat", "twitch");
    });

    this.chatClient.onMessage(
      async (
        _channel: string,
        _user: string,
        _text: string,
        msg: ChatMessage,
      ) => {
        this.handleMessage(msg, false, false);
      },
    );

    this.chatClient.onViewerMilestone(
      async (
        _channel: string,
        _user: string,
        info: ChatViewerMilestoneInfo,
        msg: UserNotice,
      ) => {
        await this.bot.commandHandler.sendToChatList({
          messageId: msg.id,
          badges: this.getBadges(msg.userInfo),
          color: getUserColor(msg.userInfo),
          displayName: getDisplayName(
            msg.userInfo.displayName,
            msg.userInfo.userName,
          ),
          emoteOffsets: msg.tags.get("emotes") ?? "",
          highlightColor: "rgba(11, 176, 129,0.5)",
          highlightMessage: `Reached ${info.value} stream watch streak!`,
          isAction: false,
          isCommand: false,
          isFake: false,
          message: msg.text ?? "",
          platform: "twitch",
          replyId: null,
          userId: msg.userInfo.userId,
          timestamp: Date.now(),
        });
      },
    );

    this.chatClient.onAction((_channel, _user, _text, msg) => {
      this.handleMessage(msg, true, false);
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
    const stream = await this.apiClient.streams.getStreamByUserId(
      this.channel.id,
    );
    if (stream) {
      this.currentGame = stream.gameId;
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

  public async channelPointReward(
    reward: ChannelPointReward,
  ): Promise<ChannelPointRewardStatus> {
    const rewards = await this.apiClient.channelPoints.getCustomRewards(
      this.channel.id,
      true,
    );
    const title = reward.title.toLowerCase();
    const found = rewards.find((e) => e.title.toLowerCase() == title);
    if (!found) {
      const created = await this.apiClient.channelPoints.createCustomReward(
        this.channel.id,
        reward,
      );
      return created;
    }

    if (
      found.title != reward.title ||
      found.cost != reward.cost ||
      found.prompt != (reward.prompt ?? "") ||
      found.autoFulfill != (reward.autoFulfill ?? false) ||
      found.globalCooldown !=
        (reward.globalCooldown == 0 ? null : reward.globalCooldown) ||
      found.isEnabled != (reward.isEnabled ?? true) ||
      found.userInputRequired != (reward.userInputRequired ?? false) ||
      found.maxRedemptionsPerStream !=
        (reward.maxRedemptionsPerStream == 0
          ? null
          : reward.maxRedemptionsPerStream) ||
      found.maxRedemptionsPerUserPerStream !=
        (reward.maxRedemptionsPerUserPerStream == 0
          ? null
          : reward.maxRedemptionsPerUserPerStream) ||
      (reward.backgroundColor != null &&
        found.backgroundColor != reward.backgroundColor)
    )
      return await this.apiClient.channelPoints.updateCustomReward(
        this.channel.id,
        found.id,
        reward,
      );

    return found;
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

  private getBadges(user: ChatUser): string[] {
    const badges = [];

    if (user.isMod) {
      badges.push(this.badges.get("moderator"));
    } else if (user.isBroadcaster) {
      badges.push(this.badges.get("broadcaster"));
    }

    if (user.isVip) badges.push(this.badges.get("vip"));

    const badge = user.badges.get("subscriber");
    if (badge != undefined) {
      badges.push(this.badges.get(badge));
    }
    return badges.filter((s): s is string => !!s);
  }

  public async parseClips(text: string): Promise<Clip | undefined> {
    const match = this.clipRegex.exec(text) ?? this.wwwclipRegex.exec(text);
    if (match === null) return undefined;

    const start = match.index;
    const end = match.index + match[0].length - 1;

    const clip = await this.apiClient.clips.getClipById(match[1]);
    if (clip === null) {
      console.error(
        "\x1b[35m%s\x1b[0m",
        `Failed getting clip info: ${match[1]}`,
      );
      return undefined;
    }

    return {
      title: clip.title,
      url: clip.url,
      thumbnailUrl: clip.thumbnailUrl,
      creator: clip.creatorDisplayName,
      start,
      end,
    };
  }
}
