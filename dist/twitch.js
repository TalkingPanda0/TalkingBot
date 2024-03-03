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
    constructor(bot) {
        this.clientId = "";
        this.clientSecret = "";
        this.redeemQueue = [];
        this.wheelOptions = [
            {
                title: "VIP",
                color: "",
                weight: 1,
                function: (user) => {
                    this.chatClient.say(this.channelName, `@${user.displayName} won VIP congratulations!`);
                },
            },
            {
                title: "Get sent to the nut room",
                color: "",
                weight: 10,
                function: (user) => {
                    this.apiClient.moderation.banUser(this.channel.id, {
                        user: user.id,
                        reason: "WHEEL",
                        duration: 30,
                    });
                },
            },
        ];
        this.badges = new Map();
        this.pollid = "10309d95-f819-4f8e-8605-3db808eff351";
        this.titleid = "cddfc228-5c5d-4d4f-bd54-313743b5fd0a";
        this.timeoutid = "a86f1b48-9779-49c1-b4a1-42534f95ec3c";
        this.wheelid = "ec1b5ebb-54cd-4ab1-b0fd-3cd642e53d64";
        this.selftimeoutid = "8071db78-306e-46e8-a77b-47c9cc9b34b3";
        this.bot = bot;
    }
    wheeltest() {
        this.bot.iowheel.emit("wheel", {
            wheelOptions: this.wheelOptions,
            user: "Ballmaster5",
            winner: "Get sent to the nut room",
        });
    }
    sendToChatList(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let color = message.userInfo.color;
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
            if (color === null || color === undefined) {
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
                text = text.replace(new RegExp(emote.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g"), `<img src=${emoteUrl} class="emote" />`);
            });
            this.bot.iochat.emit("message", {
                badges: badges,
                text: text,
                sender: message.userInfo.displayName,
                senderId: message.userInfo.userId,
                color: color,
                id: "twitch-" + message.id,
                platform: "twitch",
                isFirst: message.isFirst,
            });
        });
    }
    setupAuth(auth) {
        this.clientId = auth.twitchClientId;
        this.clientSecret = auth.twitchClientSecret;
        this.channelName = auth.channelName;
        this.dataPath = auth.playerdatapath;
        fs.writeFileSync(oauthPath, JSON.stringify({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            channelName: this.channelName,
            dataPath: this.dataPath,
        }), "utf-8");
        this.authProvider = new auth_1.RefreshingAuthProvider({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUri: "http://localhost:3000/oauth",
        });
    }
    addUser(code, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const isBroadcaster = scope.startsWith("bits:read");
            const tokenData = yield (0, auth_1.exchangeCode)(this.clientId, this.clientSecret, code, "http://localhost:3000/oauth");
            fs.writeFileSync(isBroadcaster ? broadcasterPath : botPath, JSON.stringify(tokenData, null, 4), "utf-8");
        });
    }
    readAuth() {
        const fileContent = JSON.parse(fs.readFileSync(oauthPath, "utf-8"));
        this.clientId = fileContent.clientId;
        this.clientSecret = fileContent.clientSecret;
        this.channelName = fileContent.channelName;
        this.dataPath = fileContent.dataPath;
    }
    initBot() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const channelBadges = yield this.apiClient.chat.getChannelBadges(this.channel.id);
            channelBadges.forEach((badge) => {
                if (badge.id !== "subscriber")
                    return;
                badge.versions.forEach((element) => {
                    this.badges.set(element.id, element.getImageUrl(4));
                });
            });
            const globalBadges = yield this.apiClient.chat.getGlobalBadges();
            globalBadges.forEach((badge) => {
                if (badge.id != "moderator" && badge.id != "broadcaster")
                    return;
                badge.versions.forEach((element) => {
                    this.badges.set(badge.id, element.getImageUrl(4));
                });
            });
            this.eventListener = new eventsub_ws_1.EventSubWsListener({
                apiClient: this.apiClient,
            });
            this.eventListener.onChannelFollow(this.channel.id, this.channel.id, (event) => {
                this.bot.ioalert.emit("alert", {
                    follower: event.userDisplayName,
                });
            });
            this.eventListener.onChannelPollProgress(this.channel.id, (data) => {
                let options = [];
                data.choices.forEach((choice, i) => {
                    options.push({
                        label: choice.title,
                        id: i.toString(),
                        votes: choice.totalVotes,
                    });
                });
                this.currentPoll = { title: data.title, options: options };
                this.bot.updatePoll();
            });
            this.eventListener.onChannelPollEnd(this.channel.id, (data) => {
                this.currentPoll = null;
            });
            this.eventListener.onChannelRedemptionAdd(this.channel.id, (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log(`Got redemption ${data.userDisplayName} - ${data.rewardTitle}: ${data.input} ${data.rewardId}`);
                    let completed;
                    switch (data.rewardId) {
                        case this.selftimeoutid:
                            const modlist = yield this.apiClient.moderation.getModerators(this.channel.id, { userId: data.userId });
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
                            const user = yield this.apiClient.users.getUserByName(username);
                            if (user == null || user.id == data.broadcasterId) {
                                completed = false;
                                this.chatClient.say(this.channelName, `@${data.userDisplayName} Couldn't timeout user: ${data.input}`);
                                break;
                            }
                            const mods = yield this.apiClient.moderation.getModerators(this.channel.id, { userId: user.id });
                            if (mods.data.length == 1) {
                                completed = false;
                                this.chatClient.say(this.channelName, `@${data.userDisplayName} Couldn't timeout user: ${data.input}`);
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
                    if (completed == null)
                        return;
                    console.log(completed);
                    this.apiClient.channelPoints.updateRedemptionStatusByIds(this.channel.id, data.rewardId, [data.id], completed ? "FULFILLED" : "CANCELED");
                }
                catch (e) {
                    console.log(e);
                }
            }));
            this.chatClient = new chat_1.ChatClient({
                authProvider: this.authProvider,
                channels: [this.channelName],
            });
            this.chatClient.onSub((channel, user, subInfo, msg) => {
                this.bot.ioalert.emit("alert", {
                    name: subInfo.displayName,
                    message: subInfo.message,
                    plan: subInfo.plan,
                    months: subInfo.months,
                    gift: false,
                });
            });
            this.chatClient.onSubGift((channel, user, subInfo, msg) => {
                this.bot.ioalert.emit("alert", {
                    name: subInfo.gifter,
                    gifted: subInfo.displayName,
                    message: subInfo.message,
                    plan: subInfo.plan,
                    months: subInfo.months,
                    gift: true,
                });
            });
            this.chatClient.onRaid((channel, user, raidInfo, msg) => {
                this.bot.ioalert.emit("alert", {
                    raider: raidInfo.displayName,
                    viewers: raidInfo.viewerCount,
                });
            });
            this.chatClient.onBan((channel, user, msg) => {
                this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
                this.chatClient.say(this.channelName, `@${user} has been banished to the nut room.`);
            });
            this.chatClient.onTimeout((channel, user, duration, msg) => {
                this.bot.iochat.emit("banUser", msg.tags.get("target-user-id"));
                this.chatClient.say(this.channelName, `@${user} has been banished to the nut room.`);
            });
            this.chatClient.onMessageRemove((channel, messageId, msg) => {
                this.bot.iochat.emit("deleteMessage", "twitch-" + messageId);
            });
            this.chatClient.onChatClear((channel, msg) => {
                this.bot.iochat.emit("clearChat", "twitch");
            });
            this.chatClient.onMessage((channel, user, text, msg) => __awaiter(this, void 0, void 0, function* () {
                if (user === "botrixoficial")
                    return;
                console.log("\x1b[35m%s\x1b[0m", `Twitch - ${msg.userInfo.displayName}: ${text}`);
                // not a command
                if (!text.startsWith("!")) {
                    this.sendToChatList(msg);
                    return;
                }
                const name = msg.userInfo.displayName;
                const isMod = msg.userInfo.isMod || msg.userInfo.isBroadcaster;
                for (let i = 0; i < this.bot.commandList.length; i++) {
                    const command = this.bot.commandList[i];
                    if (text.split(" ")[0] != command.command)
                        continue;
                    command.commandFunction(name, isMod, text.replace(command.command, "").trim(), (message, replyToUser) => {
                        this.chatClient.say(channel, message, {
                            replyTo: replyToUser ? msg.id : null,
                        });
                    }, talkingbot_1.Platform.twitch, msg);
                    if (command.showOnChat)
                        this.sendToChatList(msg);
                    return;
                }
                for (let i = 0; i < this.bot.customCommands.length; i++) {
                    const command = this.bot.customCommands[i];
                    console.log(command.command);
                    if (text.split(" ")[0] != command.command)
                        continue;
                    const message = text.replace(command.command, "").trim();
                    const modonly = command.response.includes("(modonly)");
                    const doReply = command.response.includes("(reply)");
                    let response = (yield (0, talkingbot_1.replaceAsync)(command.response, /(!?fetch)\[([^]+)\]/g, (message, command, url) => __awaiter(this, void 0, void 0, function* () {
                        const req = yield fetch(url);
                        const text = yield req.text();
                        if (command.startsWith("!"))
                            return "";
                        return text;
                    })))
                        .replace(/\$user/g, name)
                        .replace(/\$args/g, message)
                        .replace(/\(modonly\)/g, "")
                        .replace(/\(reply\)/g, "");
                    if (modonly && !isMod)
                        return;
                    this.chatClient.say(channel, response, {
                        replyTo: doReply ? msg.id : null,
                    });
                }
            }));
            this.chatClient.onConnect(() => {
                console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
            });
            this.chatClient.connect();
            this.eventListener.start();
        });
    }
    handleRedeemQueue(accept) {
        return __awaiter(this, void 0, void 0, function* () {
            const redeem = this.redeemQueue.shift();
            if (accept != null) {
                switch (redeem.rewardId) {
                    case this.pollid:
                        const matches = redeem.input.match(pollRegex);
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
                        }
                        else {
                            this.chatClient.say(this.channelName, `@${redeem.userDisplayName} Couldn't parse poll: ${redeem.input}`);
                            accept = false;
                        }
                        break;
                    case this.titleid:
                        const currentInfo = yield this.apiClient.channels.getChannelInfoById(this.channel.id);
                        yield this.apiClient.channels.updateChannelInfo(this.channel.id, {
                            title: redeem.input,
                        });
                        setTimeout(() => {
                            this.apiClient.channels.updateChannelInfo(this.channel.id, {
                                title: currentInfo.title,
                            });
                        }, 15 * 60 * 1000);
                        break;
                }
            }
            else {
                // scam
                accept = true;
            }
            this.apiClient.channelPoints.updateRedemptionStatusByIds(this.channel.id, redeem.rewardId, [redeem.id], accept ? "FULFILLED" : "CANCELED");
        });
    }
}
exports.Twitch = Twitch;
