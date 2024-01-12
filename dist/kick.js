"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBot = void 0;
const ws_1 = __importDefault(require("ws"));
const regex = /\[emote:(\d+):([^\]]+)\]/g;
function isCommand(message, command) {
    return message.trim().startsWith(`!${command}`);
}
function parseEmotes(message) {
    return message.replace(regex, (match, id, name) => name);
}
function cleanMessage(message) {
    message = message.substr(message.indexOf(" ") + 1);
    return parseEmotes(message).replace("sweetbabooo-o", "");
}
function initBot(sendChat, sendMessage, sendTTS, channelID) {
    const chat = new ws_1.default("wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false");
    chat.on("open", function open() {
        chat.send(JSON.stringify({
            event: "pusher:subscribe",
            data: { auth: "", channel: `chatrooms.${channelID}.v2` },
        }));
        console.log("\x1b[32m%s\x1b[0m", "Kick Setup Complete");
    });
    chat.on("error", console.error);
    chat.on("close", function close() {
        console.log("Connection closed for chatroom: " + channelID);
    });
    chat.on("message", function message(data) {
        // TODO handle other message types
        try {
            const badges = ["https://kick.com/favicon.ico"];
            const dataString = data.toString();
            const jsonData = JSON.parse(dataString);
            const jsonDataSub = JSON.parse(jsonData.data);
            let chatMessage = jsonDataSub.content;
            const jsonBadges = jsonDataSub.sender.identity.badges;
            jsonBadges.forEach((element) => {
                if (element.type === "moderator") {
                    badges.push("/static/kickmod.svg");
                }
                else if (element.type === "subscriber") {
                    badges.push("/static/kicksub.svg");
                }
            });
            sendChat({
                badges: badges,
                text: parseEmotes(chatMessage),
                sender: jsonDataSub.sender.username,
                color: jsonDataSub.sender.identity.color,
            });
            console.log("\x1b[32m%s\x1b[0m", `Kick - ${jsonDataSub.sender.username}: ${chatMessage}`);
            if (isCommand(chatMessage, "bsr")) {
                console.log(chatMessage);
                sendMessage(chatMessage);
                return;
            }
            if (isCommand(chatMessage, "tts")) {
                const ttsMessage = {
                    text: cleanMessage(chatMessage),
                    sender: jsonDataSub.sender.username,
                };
                sendTTS(ttsMessage, false);
                return;
            }
            const firstBadgeType = jsonDataSub.sender.identity.badges[0].type;
            if (firstBadgeType === "moderator" || firstBadgeType === "broadcaster") {
                if (isCommand(chatMessage, "modtts")) {
                    const ttsMessage = {
                        text: cleanMessage(chatMessage),
                        sender: jsonDataSub.sender.username,
                    };
                    sendTTS(ttsMessage, true);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.initBot = initBot;
