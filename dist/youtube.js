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
exports.YouTube = void 0;
const tubechat_1 = require("tubechat");
const talkingbot_1 = require("./talkingbot");
class YouTube {
    initBot() {
        return __awaiter(this, void 0, void 0, function* () {
            this.chat.connect(this.channelName);
            this.chat.on("chat_connected", (channel, videoId) => {
                console.log("\x1b[31m%s\x1b[0m", `Youtube setup complete: ${videoId}`);
            });
            this.chat.on("message", ({ badges, channel, channelId, color, id, isMembership, isModerator, isNewMember, isOwner, isVerified, message, name, thumbnail, timestamp, }) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let text = message.at(0).text;
                    const isMod = isModerator || isOwner;
                    if (text == null)
                        return;
                    console.log("\x1b[31m%s\x1b[0m", `YouTube - ${name}: ${text}`);
                    let badgeList = ["https://www.youtube.com/favicon.ico"];
                    if (badges.moderator) {
                        badgeList.push(badges.thumbnail.url);
                    }
                    if (!text.startsWith("!")) {
                        // not a command!
                        this.bot.iochat.emit("message", {
                            badges: badgeList,
                            text: text,
                            sender: name,
                            senderId: "youtube",
                            color: color,
                            id: "youtube-" + id,
                            platform: "youtube",
                            isFirst: false,
                            replyTo: "",
                            replyId: "",
                        });
                        return;
                    }
                    let commandName = text.split(" ")[0];
                    for (let i = 0; i < this.bot.aliasCommands.length; i++) {
                        const alias = this.bot.aliasCommands[i];
                        if (commandName != alias.alias)
                            continue;
                        text = text.replace(alias.alias, alias.command);
                        commandName = alias.command;
                    }
                    for (let i = 0; i < this.bot.commandList.length; i++) {
                        const command = this.bot.commandList[i];
                        if (commandName != command.command)
                            continue;
                        command.commandFunction(name, isMod, text.replace(command.command, "").trim(), (message, replyToUser) => {
                            // can't
                        }, talkingbot_1.Platform.youtube);
                        if (command.showOnChat) {
                            this.bot.iochat.emit("message", {
                                badges: ["https://www.youtube.com/favicon.ico"],
                                text: text,
                                sender: name,
                                senderId: "youtube",
                                color: color,
                                id: "youtube-" + id,
                                platform: "youtube",
                                isFirst: false,
                                replyTo: "",
                                replyId: "",
                            });
                        }
                        return;
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }));
        });
    }
    constructor(channelName, bot) {
        this.channelName = channelName;
        this.bot = bot;
        this.chat = new tubechat_1.TubeChat();
    }
}
exports.YouTube = YouTube;
