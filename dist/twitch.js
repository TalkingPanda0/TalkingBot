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
const chat_1 = require("@twurple/chat");
const talkingbot_1 = require("./talkingbot");
// Get the tokens from ../tokens.json
const { clientId, accessToken, refreshToken, clientSecret } = require('../tokens.json');
const authProvider = new auth_1.RefreshingAuthProvider({ clientId, clientSecret });
class Twitch {
    constructor(channelName, commandList) {
        this.commandList = [];
        this.channelName = channelName;
        this.commandList = commandList;
    }
    sendMessage(message) {
        this.chatClient.say(this.channelName, message);
    }
    initBot() {
        return __awaiter(this, void 0, void 0, function* () {
            yield authProvider.addUserForToken({
                accessToken,
                refreshToken,
                expiresIn: null,
                obtainmentTimestamp: 0
            }, ['chat']);
            //authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8'));
            this.chatClient = new chat_1.ChatClient({ authProvider, channels: [this.channelName] });
            this.chatClient.onMessage((channel, user, text, msg) => __awaiter(this, void 0, void 0, function* () {
                console.log("\x1b[35m%s\x1b[0m", `Twitch - ${user}: ${text}`);
                // not a command
                if (!text.startsWith("!"))
                    return;
                this.commandList.forEach((command) => {
                    if (!text.startsWith(command.command))
                        return;
                    command.commandFunction(user, msg.userInfo.isMod || msg.userInfo.isBroadcaster, text.substr(text.indexOf(" ") + 1), (message) => {
                        this.chatClient.say(channel, message, { replyTo: msg.id });
                    }, talkingbot_1.Platform.twitch, msg);
                });
            }));
            this.chatClient.onConnect(() => {
                console.log("\x1b[35m%s\x1b[0m", "Twitch setup complete");
            });
            this.chatClient.connect();
        });
    }
}
exports.Twitch = Twitch;
