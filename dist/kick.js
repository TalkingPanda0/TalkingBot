"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kick = void 0;
const ws_1 = __importDefault(require("ws"));
const talkingbot_1 = require("./talkingbot");
class Kick {
    constructor(channelId, commandList, bot) {
        this.channelId = channelId;
        this.commandList = commandList;
        this.bot = bot;
    }
    initBot() {
        const chat = new ws_1.default("wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false");
        chat.on("open", () => {
            chat.send(JSON.stringify({
                event: "pusher:subscribe",
                data: { auth: "", channel: `chatrooms.${this.channelId}.v2` },
            }));
            console.log("\x1b[32m%s\x1b[0m", "Kick Setup Complete");
        });
        chat.on("error", console.error);
        chat.on("close", () => {
            console.log("Connection closed for chatroom: " + this.channelId);
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
                        let firstBadgeType = "";
                        if (userBadges.length != 0) {
                            firstBadgeType = userBadges[0].type;
                            const jsonBadges = jsonDataSub.sender.identity.badges;
                            jsonBadges.forEach((element) => {
                                if (element.type === "moderator") {
                                    badges.push("/kickmod.svg");
                                }
                                else if (element.type === "subscriber") {
                                    badges.push("/kicksub.svg");
                                }
                            });
                        }
                        this.bot.iochat.emit("message", {
                            text: this.parseEmotes(text),
                            sender: jsonDataSub.sender.username,
                            senderId: jsonDataSub.sender.id,
                            badges: badges,
                            color: jsonDataSub.sender.identity.color,
                            id: "kick-" + jsonDataSub.id,
                            platform: "kick",
                        });
                        console.log("\x1b[32m%s\x1b[0m", `Kick - ${jsonDataSub.sender.username}: ${text}`);
                        this.commandList.forEach((command) => {
                            if (!text.startsWith(command.command))
                                return;
                            command.commandFunction(user, firstBadgeType === "moderator" ||
                                firstBadgeType === "broadcaster", text.replace(command.command, "").trim(), (message) => {
                                // Can't reply on kick yet
                            }, talkingbot_1.Platform.kick);
                        });
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
                        if (jsonDataSub.poll.duration != jsonDataSub.poll.remaining)
                            return;
                        const options = jsonDataSub.poll.options.map((item) => item.label);
                        this.bot.twitch.apiClient.polls.createPoll(this.bot.twitch.channel.id, {
                            title: jsonDataSub.poll.title,
                            duration: jsonDataSub.poll.duration,
                            choices: options,
                        });
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
        return message.replace(regex, (match, id, name) => `<img src="https://files.kick.com/emotes/${id}/fullsize" height=20 />`);
    }
}
exports.Kick = Kick;
