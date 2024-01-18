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
const talkingbot_1 = require("./talkingbot");
const fs = __importStar(require("fs"));
// Get the tokens from ../tokens.json
const oauthPath = 'oauth.json';
const botPath = 'token-bot.json';
const broadcasterPath = 'token-broadcaster.json';
class Twitch {
    constructor(channelName, commandList) {
        this.clientId = "";
        this.clientSecret = "";
        this.commandList = [];
        this.channelName = channelName;
        this.commandList = commandList;
    }
    sendMessage(message) {
        this.chatClient.say(this.channelName, message);
    }
    initBot() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContent = JSON.parse(fs.readFileSync(oauthPath, 'utf-8'));
            this.clientId = fileContent.clientId;
            this.clientSecret = fileContent.clientSecret;
            this.authProvider = new auth_1.RefreshingAuthProvider({ clientId: this.clientId, clientSecret: this.clientSecret, redirectUri: "http://localhost:3000/oauth" });
            this.authProvider.onRefresh((userId, newTokenData) => __awaiter(this, void 0, void 0, function* () {
                let isBroadcaster = newTokenData.scope[0].startsWith("bits:read");
                fs.writeFileSync(isBroadcaster ? broadcasterPath : botPath, JSON.stringify(newTokenData, null, 4), 'utf-8');
            }));
            yield this.authProvider.addUserForToken(JSON.parse(fs.readFileSync(botPath, 'utf-8')), ["chat"]);
            yield this.authProvider.addUserForToken(JSON.parse(fs.readFileSync(broadcasterPath, 'utf-8')), [""]);
            this.chatClient = new chat_1.ChatClient({ authProvider: this.authProvider, channels: [this.channelName] });
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
    setupAuth(auth) {
        this.clientId = auth.twitchClientId;
        this.clientSecret = auth.twitchClientSecret;
        fs.writeFileSync(oauthPath, JSON.stringify({ "clientId": this.clientId, "clientSecret": this.clientSecret }), 'utf-8');
        this.authProvider = new auth_1.RefreshingAuthProvider({ clientId: this.clientId, clientSecret: this.clientSecret, redirectUri: "http://localhost:3000/oauth" });
    }
    addUser(code, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            let isBroadcaster = scope.startsWith("bits:read");
            const tokenData = yield (0, auth_1.exchangeCode)(this.clientId, this.clientSecret, code, "http://localhost:3000/oauth");
            fs.writeFileSync(isBroadcaster ? broadcasterPath : botPath, JSON.stringify(tokenData, null, 4), 'utf-8');
        });
    }
}
exports.Twitch = Twitch;
