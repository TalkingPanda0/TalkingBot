import { RefreshingAuthProvider, exchangeCode } from "@twurple/auth";
import { ChatClient, ChatMessage, ClearChat, ClearMsg } from "@twurple/chat";
import { ApiClient, HelixUser } from "@twurple/api";
import { AuthSetup, Command, Platform, TalkingBot } from "./talkingbot";
import * as fs from "fs";
import { PubSubClient, PubSubRedemptionMessage } from "@twurple/pubsub";
import { start } from "repl";
import { channel } from "diagnostics_channel";

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
  public pubsub: PubSubClient;

  private channelName: string;
  private bot: TalkingBot;
  private chatClient: ChatClient;
  private commandList: Command[] = [];
  private authProvider: RefreshingAuthProvider;
  private badges: Map<string, string> = new Map<string, string>();
  constructor(commandList: Command[], bot: TalkingBot) {
    this.commandList = commandList;
    this.bot = bot;
  }

  public sendMessage(message: string) {
    this.chatClient.say(this.channelName, message);
  }

  async sendToChatList(message: ChatMessage): Promise<void> {
    let color = await this.apiClient.chat.getColorForUser(
      message.userInfo.userId,
    );
    let badges = ["https://twitch.tv/favicon.ico"];

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
    if (color == null || color == undefined) {
      color = userColors[parseInt(message.userInfo.userId) % userColors.length];
    }

    let text = message.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
        new RegExp(emote, "g"),
        `<img src=${emoteUrl} height="20" />`,
      );
    });

    this.bot.iochat.emit("message", {
      badges: badges,
      text: text,
      sender: message.userInfo.displayName,
      senderId: message.userInfo.userId,
      color: color,
      id: "twitch-" + message.id,
      platform: "twitch",
    });
  }
  async initBot(): Promise<void> {
    const fileContent = JSON.parse(fs.readFileSync(oauthPath, "utf-8"));
    this.clientId = fileContent.clientId;
    this.clientSecret = fileContent.clientSecret;
    this.channelName = fileContent.channelName;

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
    const cbadges = await this.apiClient.chat.getChannelBadges(this.channel.id);
    cbadges.forEach((badge) => {
      if (badge.id !== "subscriber") return;
      badge.versions.forEach((element) => {
        this.badges.set(element.id, element.getImageUrl(4));
      });
    });
    const gbadges = await this.apiClient.chat.getGlobalBadges();
    gbadges.forEach((badge) => {
      if (badge.id != "moderator" && badge.id != "broadcaster") return;
      badge.versions.forEach((element) => {
        this.badges.set(badge.id, element.getImageUrl(4));
      });
    });

    this.pubsub = new PubSubClient({ authProvider: this.authProvider });
    this.pubsub.onRedemption(
      this.channel.id,
      (message: PubSubRedemptionMessage) => {
        console.log(
          `Got redemption ${message.userDisplayName} - ${message.rewardTitle}: ${message.message}`,
        );
        switch (message.rewardTitle) {
          case "Self Timeout":
            this.apiClient.moderation.banUser(this.channel.id, {
              duration: 300,
              reason: "Self Timeout Request",
              user: message.userId,
            });
            break;
          case "Timeout Somebody Else":
            this.apiClient.moderation.banUser(this.channel.id, {
              duration: 60,
              reason: `Timeout request by ${message.userDisplayName}`,
              user: message.message,
            });
            break;
          case "Poll":
            // message like Which is better?: hapboo, realboo, habpoo, hapflat
            const matches = message.message.match(pollRegex);
            if (matches) {
              const question = matches[1];
              const options = matches[2].split(",").map((word) => word.trim());
              this.apiClient.polls.createPoll(this.channel.id, {
                title: question,
                duration: 60,
                choices: options,
              });
            } else {
              this.chatClient.say(
                this.channelName,
                `Couldn't parse poll: ${message.message}`,
              );
              this.apiClient.channelPoints.updateRedemptionStatusByIds(
                this.channel.id,
                message.rewardId,
                [message.id],
                "CANCELED",
              );

              return;
            }
            break;
        }
        this.apiClient.channelPoints.updateRedemptionStatusByIds(
          this.channel.id,
          message.rewardId,
          [message.id],
          "FULFILLED",
        );
      },
    );

    this.chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [this.channelName, "sweetbabooO_o"],
    });

    this.chatClient.onBan((channel: string, user: string, msg: ClearChat) => {
      this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
    });
    this.chatClient.onTimeout(
      (channel: string, user: string, duration: number, msg: ClearChat) => {
        this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
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
        console.log(
          "\x1b[35m%s\x1b[0m",
          `Twitch - ${msg.userInfo.displayName}: ${text}`,
        );

        this.sendToChatList(msg);

        // not a command
        if (!text.startsWith("!")) return;

        this.commandList.forEach((command) => {
          if (!text.startsWith(command.command)) return;

          command.commandFunction(
            user,
            msg.userInfo.isMod || msg.userInfo.isBroadcaster,
            text.replace(command.command, "").trim(),
            (message: string) => {
              this.chatClient.say(channel, message, { replyTo: msg.id });
            },
            Platform.twitch,
            msg,
          );
        });
      },
    );

    this.chatClient.onConnect(() => {
      console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
    });

    this.chatClient.connect();
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
    let isBroadcaster: Boolean = scope.startsWith("bits:read");
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
}
