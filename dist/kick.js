"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kick = void 0;
const ws_1 = __importDefault(require("ws"));
const talkingbot_1 = require("./talkingbot");
class Kick {
    constructor(channelId, commandList) {
        this.channelId = channelId;
        const chat = new ws_1.default("wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false");
        chat.on("open", function open() {
            chat.send(JSON.stringify({
                event: "pusher:subscribe",
                data: { auth: "", channel: `chatrooms.${channelId}.v2` },
            }));
            console.log("\x1b[32m%s\x1b[0m", "Kick Setup Complete");
        });
        chat.on("error", console.error);
        chat.on("close", function close() {
            console.log("Connection closed for chatroom: " + channelId);
        });
        chat.on("message", function message(data) {
            // TODO handle other message types
            try {
                const badges = ["https://kick.com/favicon.ico"];
                const dataString = data.toString();
                const jsonData = JSON.parse(dataString);
                const jsonDataSub = JSON.parse(jsonData.data);
                const text = jsonDataSub.content;
                const user = jsonDataSub.sender.username;
                const firstBadgeType = jsonDataSub.sender.identity.badges[0].type;
                const jsonBadges = jsonDataSub.sender.identity.badges;
                jsonBadges.forEach((element) => {
                    if (element.type === "moderator") {
                        badges.push("/static/kickmod.svg");
                    }
                    else if (element.type === "subscriber") {
                        badges.push("/static/kicksub.svg");
                    }
                });
                console.log("\x1b[32m%s\x1b[0m", `Kick - ${jsonDataSub.sender.username}: ${text}`);
                commandList.forEach((command) => {
                    if (!text.startsWith(command.command))
                        return;
                    command.commandFunction(user, firstBadgeType === "moderator" || firstBadgeType === "broadcaster", text.substr(text.indexOf(" ") + 1), (message) => {
                        // Can't reply on kick yet
                    }, talkingbot_1.Platform.kick);
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.Kick = Kick;
