"use strict";
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
const easy_bot_1 = require("@twurple/easy-bot");
const api_1 = require("@twurple/api");
// Get the tokens from ../tokens.json
const { clientId, accessToken, refreshToken, clientSecret } = require('../tokens.json');
const authProvider = new auth_1.RefreshingAuthProvider({ clientId, clientSecret });
const userColors = ["#ff0000", "#0000ff", "#b22222", "#ff7f50", "#9acd32", "#ff4500", "#2e8b57", "#daa520", "#d2691e", "#5f9ea0", "#1e90ff", "#ff69b4", "#8a2be2", "#00ff7f"];
function removeByIndex(str, index) {
    return str.slice(0, index) + str.slice(index + 1);
}
function removeByIndexToUppercase(str, indexes) {
    let deletedChars = 0;
    indexes.forEach((index) => {
        let i = index - deletedChars;
        while (!isNaN(parseInt(str.charAt(i), 10)) || str.charAt(i) !== str.charAt(i).toUpperCase()) {
            str = removeByIndex(str, i);
            deletedChars++;
        }
    });
    // remove chars before the first space in str before returning it
    str = str.split(" ").slice(1).join(" ");
    return str;
}
class Twitch {
    constructor(sendToChat, sendTTS, channelName) {
        this.sendTTS = sendTTS;
        this.channelName = channelName;
        this.sendToChat = sendToChat;
    }
    sendToChatList(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let color = yield this.apiClient.chat.getColorForUser(message.userId);
            let badges = ["https://twitch.tv/favicon.ico"];
            // User hasn't set a color get a "random" color
            if (color == null || color == undefined) {
                color = userColors[parseInt(message.userId) % userColors.length];
            }
            this.sendToChat({
                badges: badges,
                text: message.text,
                sender: message.userDisplayName,
                color: color,
            });
        });
    }
    initBot() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield authProvider.addUserForToken({
                accessToken,
                refreshToken,
                expiresIn: null,
                obtainmentTimestamp: 0
            }, ['chat']);
            //authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8'));
            let apiClient = new api_1.ApiClient({ authProvider });
            this.channelID = ((_a = yield apiClient.users.getUserByName(this.channelName)) !== null && _a !== void 0 ? _a : { id: "0" }).id;
            this.channelBadges = yield apiClient.chat.getChannelBadges(this.channelID);
            this.apiClient = apiClient;
            const bot = new easy_bot_1.Bot({
                authProvider, channel: this.channelName,
                commands: [
                    (0, easy_bot_1.createBotCommand)('dice', (params, { reply }) => {
                        const diceRoll = Math.floor(Math.random() * 6) + 1;
                        reply(`You rolled a ${diceRoll}`);
                    }),
                    (0, easy_bot_1.createBotCommand)('kick', (params, { reply }) => {
                        reply("SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o");
                    }),
                    (0, easy_bot_1.createBotCommand)('tts', (params, context) => {
                        this.sendToChatList({ "text": context.msg.text, "userId": context.userId, "userDisplayName": context.userDisplayName });
                        let message = context.msg.text.trim();
                        try {
                            var indexes = [];
                            context.msg.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                            message = removeByIndexToUppercase(message, indexes);
                            let ttsMessage = {
                                text: message,
                                sender: context.userName,
                                emoteOffsets: context.msg.emoteOffsets,
                            };
                            this.sendTTS(ttsMessage, false);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }),
                    (0, easy_bot_1.createBotCommand)('modtts', (params, context) => {
                        this.sendToChatList({ "text": context.msg.text, "userId": context.userId, "userDisplayName": context.userDisplayName });
                        if (!context.msg.userInfo.isMod && !context.msg.userInfo.isBroadcaster)
                            return;
                        let message = context.msg.text.trim();
                        try {
                            var indexes = [];
                            context.msg.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                            message = removeByIndexToUppercase(message, indexes);
                            let ttsMessage = {
                                text: message,
                                sender: context.userName,
                            };
                            this.sendTTS(ttsMessage, true);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }),
                ]
            });
            bot.onAuthenticationSuccess(() => {
                console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
                // bot.say(this.channelName,"Talkingbot initiated!");
            });
            /*bot.onMessage(async (messageEvent: BotCommandContext) => {
                console.log("\x1b[35m%s\x1b[0m", `Twitch - ${MessageEvent.userDisplayName}: ${MessageEvent.text}`);
                //this.sendToChatList(MessageEvent);
            });*/
            this.bot = bot;
        });
    }
    sendMessage(message) {
        console.log(this.channelName);
        this.bot.say(this.channelName, message);
    }
}
exports.Twitch = Twitch;
