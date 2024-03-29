"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kick = void 0;
const ws_1 = __importDefault(require("ws"));
const talkingbot_1 = require("./talkingbot");
class Kick {
    constructor(channelId, bot) {
        this.channelId = channelId;
        this.bot = bot;
    }
    initBot() {
        const chat = new ws_1.default("wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false");
        chat.on("open", () => {
            chat.send(JSON.stringify({
                event: "pusher:subscribe",
                data: { auth: "", channel: `chatrooms.${this.channelId}.v2` },
            }));
            console.log("\x1b[32m%s\x1b[0m", "Kick setup complete");
        });
        chat.on("error", console.error);
        chat.on("close", () => {
            console.log("Connection closed for chatroom, trying to reconnect...");
            setInterval(this.initBot, 250);
        });
        chat.on("message", (data) => {
            try {
                const badges = ["https://kick.com/favicon.ico"];
                const dataString = data.toString();
                const jsonData = JSON.parse(dataString);
                const jsonDataSub = JSON.parse(jsonData.data);
                switch (jsonData.event) {
                    case "App\\Events\\ChatMessageEvent":
                        const text = jsonDataSub.content
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;");
                        const user = jsonDataSub.sender.username;
                        const userBadges = jsonDataSub.sender.identity.badges;
                        if (user === "BotRix")
                            return;
                        let firstBadgeType = "";
                        if (userBadges.length != 0) {
                            firstBadgeType = userBadges[0].type;
                            const jsonBadges = jsonDataSub.sender.identity.badges;
                            jsonBadges.forEach((element) => {
                                if (element.type === "moderator") {
                                    badges.push("/static/kickmod.svg");
                                }
                                else if (element.type === "subscriber") {
                                    badges.push("/static/kicksub.svg");
                                }
                            });
                        }
                        console.log("\x1b[32m%s\x1b[0m", `Kick - ${jsonDataSub.sender.username}: ${text}`);
                        let replyTo = "";
                        let replyId = "";
                        // is a reply
                        if (jsonDataSub.metadata != undefined) {
                            replyTo = jsonDataSub.metadata.original_sender.username;
                            replyId = jsonDataSub.metadata.original_sender.id;
                        }
                        if (!text.startsWith("!")) {
                            this.bot.iochat.emit("message", {
                                text: this.parseEmotes(text),
                                sender: jsonDataSub.sender.username,
                                senderId: "kick-" + jsonDataSub.sender.id,
                                badges: badges,
                                color: jsonDataSub.sender.identity.color,
                                id: "kick-" + jsonDataSub.id,
                                platform: "kick",
                                isFirst: false,
                                replyTo: replyTo,
                                replyId: "kick-" + replyId,
                            });
                            return;
                        }
                        for (let i = 0; i < this.bot.commandList.length; i++) {
                            let command = this.bot.commandList[i];
                            if (!text.startsWith(command.command))
                                continue;
                            command.commandFunction(user, firstBadgeType === "moderator" ||
                                firstBadgeType === "broadcaster", text.replace(command.command, "").trim(), (message, replyToUser) => {
                                // Can't reply on kick yet
                            }, talkingbot_1.Platform.kick);
                            if (!command.showOnChat)
                                return;
                            this.bot.iochat.emit("message", {
                                text: this.parseEmotes(text),
                                sender: jsonDataSub.sender.username,
                                senderId: "kick-" + jsonDataSub.sender.id,
                                badges: badges,
                                color: jsonDataSub.sender.identity.color,
                                id: "kick-" + jsonDataSub.id,
                                platform: "kick",
                                isFirst: false,
                                replyTo: replyTo,
                                replyId: "kick-" + replyId,
                            });
                        }
                        break;
                    case "App\\Events\\MessageDeletedEvent":
                        this.bot.iochat.emit("messageDelete", "kick-" + jsonDataSub.message.id);
                        break;
                    case "App\\Events\\ChatroomClearEvent":
                        this.bot.iochat.emit("clearChat", "kick");
                        break;
                    case "App\\Events\\UserBannedEvent":
                        this.bot.iochat.emit("banUser", jsonDataSub.user.id);
                        break;
                    case "App\\Events\\PollUpdateEvent":
                        this.currentPoll = jsonDataSub.poll;
                        if (jsonDataSub.poll.duration != jsonDataSub.poll.remaining) {
                            this.bot.updatePoll();
                            break;
                        }
                        setTimeout(() => {
                            this.currentPoll = null;
                        }, jsonDataSub.poll.duration * 1000);
                        const options = jsonDataSub.poll.options.map((item) => item.label);
                        this.bot.twitch.apiClient.polls.createPoll(this.bot.twitch.channel.id, {
                            title: jsonDataSub.poll.title,
                            duration: jsonDataSub.poll.duration,
                            choices: options,
                        });
                        this.bot.iopoll.emit("createPoll", jsonDataSub.poll);
                        break;
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    parseEmotes(message) {
        const regex = /\[emote:(\d+):([^\]]+)\]/g;
        return message.replace(regex, (match, id, name) => `<img src="https://files.kick.com/emotes/${id}/fullsize" class="emote" />`);
    }
}
exports.Kick = Kick;
