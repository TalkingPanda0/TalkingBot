import { RefreshingAuthProvider, exchangeCode } from "@twurple/auth";
import { ChatClient, ChatMessage } from "@twurple/chat";
import { ApiClient, HelixUser } from "@twurple/api";
import { AuthSetup, Command, Platform } from "./talkingbot";
import * as fs from "fs";
import { PubSubClient, PubSubRedemptionMessage } from "@twurple/pubsub";

// Get the tokens from ../tokens.json
const oauthPath = "oauth.json";
const botPath = "token-bot.json";
const broadcasterPath = "token-broadcaster.json";
const pollRegex = /^(.*?):\s*(.*)$/;

export class Twitch {
  public clientId: string = "";
  public clientSecret: string = "";
  public apiClient: ApiClient;
  public channel: HelixUser;
  public pubsub: PubSubClient;

  private channelName: string;
  private chatClient: ChatClient;
  private commandList: Command[] = [];
  private authProvider: RefreshingAuthProvider;

  constructor(channelName: string, commandList: Command[]) {
    this.channelName = channelName;
    this.commandList = commandList;
  }

  public sendMessage(message: string) {
    this.chatClient.say(this.channelName, message);
  }

  async initBot(): Promise<void> {
    const fileContent = JSON.parse(fs.readFileSync(oauthPath, "utf-8"));
    this.clientId = fileContent.clientId;
    this.clientSecret = fileContent.clientSecret;

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
      channels: [this.channelName],
    });

    this.chatClient.onMessage(
      async (channel: string, user: string, text: string, msg: ChatMessage) => {
        console.log("\x1b[35m%s\x1b[0m", `Twitch - ${user}: ${text}`);

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

    fs.writeFileSync(
      oauthPath,
      JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
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