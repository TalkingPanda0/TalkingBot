"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Twitch = void 0;
const auth_1 = require("@twurple/auth");
const chat_1 = require("@twurple/chat");
const api_1 = require("@twurple/api");
const talkingbot_1 = require("./talkingbot");
const fs = __importStar(require("fs"));
const eventsub_ws_1 = require("@twurple/eventsub-ws");
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
class Twitch {
    constructor(commandList, bot) {
        this.clientId = "";
        this.clientSecret = "";
        this.commandList = [];
        this.badges = new Map();
        this.commandList = commandList;
        this.bot = bot;
    }
    sendMessage(message) {
        this.chatClient.say(this.channelName, message);
    }
    sendToChatList(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let color = yield this.apiClient.chat.getColorForUser(message.userInfo.userId);
            let badges = ["https://twitch.tv/favicon.ico"];
            const badge = message.userInfo.badges.get("subscriber");
            if (badge != undefined) {
                badges.push(this.badges.get(badge));
            }
            if (message.userInfo.isMod) {
                badges.push(this.badges.get("moderator"));
            }
            else if (message.userInfo.isBroadcaster) {
                badges.push(this.badges.get("broadcaster"));
            }
            // User hasn't set a color get a "random" color
            if (color == null || color == undefined) {
                color = userColors[parseInt(message.userInfo.userId) % userColors.length];
            }
            let text = message.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            let emotes = new Map();
            message.emoteOffsets.forEach((offsets, emote) => {
                let startIndex = parseInt(offsets[0]);
                let endIndex = parseInt(offsets[0].slice(offsets[0].indexOf("-") + 1)) + 1;
                let emoteString = text.slice(startIndex, endIndex);
                emotes.set(emoteString, `https://static-cdn.jtvnw.net/emoticons/v2/${emote}/default/dark/3.0`);
            });
            emotes.forEach((emoteUrl, emote) => {
                text = text.replace(new RegExp(emote, "g"), `<img src=${emoteUrl} height="20" />`);
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
        });
    }
    initBot() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContent = JSON.parse(fs.readFileSync(oauthPath, "utf-8"));
            this.clientId = fileContent.clientId;
            this.clientSecret = fileContent.clientSecret;
            this.channelName = fileContent.channelName;
            this.authProvider = new auth_1.RefreshingAuthProvider({
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                redirectUri: "http://localhost:3000/oauth",
            });
            this.authProvider.onRefresh((userId, newTokenData) => __awaiter(this, void 0, void 0, function* () {
                let isBroadcaster = newTokenData.scope[0].startsWith("bits:read");
                fs.writeFileSync(isBroadcaster ? broadcasterPath : botPath, JSON.stringify(newTokenData, null, 4), "utf-8");
            }));
            yield this.authProvider.addUserForToken(JSON.parse(fs.readFileSync(botPath, "utf-8")), ["chat"]);
            yield this.authProvider.addUserForToken(JSON.parse(fs.readFileSync(broadcasterPath, "utf-8")), [""]);
            this.apiClient = new api_1.ApiClient({ authProvider: this.authProvider });
            this.channel = yield this.apiClient.users.getUserByName(this.channelName);
            const cbadges = yield this.apiClient.chat.getChannelBadges(this.channel.id);
            cbadges.forEach((badge) => {
                if (badge.id !== "subscriber")
                    return;
                badge.versions.forEach((element) => {
                    this.badges.set(element.id, element.getImageUrl(4));
                });
            });
            const gbadges = yield this.apiClient.chat.getGlobalBadges();
            gbadges.forEach((badge) => {
                if (badge.id != "moderator" && badge.id != "broadcaster")
                    return;
                badge.versions.forEach((element) => {
                    this.badges.set(badge.id, element.getImageUrl(4));
                });
            });
            this.eventListener = new eventsub_ws_1.EventSubWsListener({ apiClient: this.apiClient });
            this.eventListener.onChannelRedemptionAdd(this.channel.id, (data) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Got redemption ${data.userDisplayName} - ${data.rewardTitle}: ${data.input}`);
                let completed = false;
                switch (data.rewardTitle) {
                    case "Self Timeout":
                        this.apiClient.moderation.banUser(this.channel.id, {
                            duration: 300,
                            reason: "Self Timeout Request",
                            user: data.userId,
                        });
                        completed = true;
                        break;
                    case "Timeout Somebody Else":
                        const user = yield this.apiClient.users.getUserByName(data.input.split(" ")[0]);
                        this.apiClient.moderation.banUser(this.channel.id, {
                            duration: 60,
                            reason: `Timeout request by ${data.userDisplayName}`,
                            user: data.input,
                        });
                        completed = true;
                        break;
                    case "Poll":
                        // message like Which is better?: hapboo, realboo, habpoo, hapflat
                        const matches = data.input.match(pollRegex);
                        if (matches) {
                            const question = matches[1];
                            const options = matches[2]
                                .split(",")
                                .map((word) => word.trim());
                            this.apiClient.polls.createPoll(this.channel.id, {
                                title: question,
                                duration: 60,
                                choices: options,
                            });
                            completed = true;
                        }
                        else {
                            this.chatClient.say(this.channelName, `Couldn't parse poll: ${data.input}`);
                            completed = false;
                        }
                        break;
                }
                this.apiClient.channelPoints.updateRedemptionStatusByIds(this.channel.id, data.rewardId, [data.id], completed ? "FULFILLED" : "CANCELED");
            }));
            this.eventListener.onChannelBan(this.channel.id, (event) => {
                console.log(event.reason);
                console.log(event.userDisplayName);
                console.log(event.moderatorDisplayName);
                console.log(event.isPermanent);
                console.log(event.endDate);
            });
            this.chatClient = new chat_1.ChatClient({
                authProvider: this.authProvider,
                channels: [this.channelName],
            });
            this.chatClient.onBan((channel, user, msg) => {
                this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
            });
            this.chatClient.onTimeout((channel, user, duration, msg) => {
                this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
            });
            this.chatClient.onMessageRemove((channel, messageId, msg) => {
                this.bot.iochat.emit("deleteMessage", "twitch-" + messageId);
            });
            this.chatClient.onChatClear((channel, msg) => {
                this.bot.iochat.emit("clearChat", "twitch");
            });
            this.chatClient.onMessage((channel, user, text, msg) => __awaiter(this, void 0, void 0, function* () {
                console.log("\x1b[35m%s\x1b[0m", `Twitch - ${msg.userInfo.displayName}: ${text}`);
                this.sendToChatList(msg);
                // not a command
                if (!text.startsWith("!"))
                    return;
                this.commandList.forEach((command) => {
                    if (!text.startsWith(command.command))
                        return;
                    command.commandFunction(user, msg.userInfo.isMod || msg.userInfo.isBroadcaster, text.replace(command.command, "").trim(), (message) => {
                        this.chatClient.say(channel, message, { replyTo: msg.id });
                    }, talkingbot_1.Platform.twitch, msg);
                });
            }));
            this.chatClient.onConnect(() => {
                console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
            });
            this.chatClient.connect();
            this.eventListener.start();
        });
    }
    setupAuth(auth) {
        this.clientId = auth.twitchClientId;
        this.clientSecret = auth.twitchClientSecret;
        this.channelName = auth.channelName;
        fs.writeFileSync(oauthPath, JSON.stringify({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            channelName: this.channelName,
        }), "utf-8");
        this.authProvider = new auth_1.RefreshingAuthProvider({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUri: "http://localhost:3000/oauth",
        });
    }
    addUser(code, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            let isBroadcaster = scope.startsWith("bits:read");
            const tokenData = yield (0, auth_1.exchangeCode)(this.clientId, this.clientSecret, code, "http://localhost:3000/oauth");
            fs.writeFileSync(isBroadcaster ? broadcasterPath : botPath, JSON.stringify(tokenData, null, 4), "utf-8");
        });
    }
}
exports.Twitch = Twitch;
