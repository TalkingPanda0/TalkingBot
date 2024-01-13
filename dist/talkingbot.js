"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalkingBot = exports.Platform = void 0;
const twitch_1 = require("./twitch");
const kick_1 = require("./kick");
var Platform;
(function (Platform) {
    Platform[Platform["twitch"] = 0] = "twitch";
    Platform[Platform["kick"] = 1] = "kick";
})(Platform || (exports.Platform = Platform = {}));
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
function parseEmotes(message) {
    const regex = /\[emote:(\d+):([^\]]+)\]/g;
    return message.replace(regex, (match, id, name) => name).replace("sweetbabooo-o", "");
}
class TalkingBot {
    constructor(channelName, kickId, sendTTS) {
        this.commandList = [];
        this.channelName = channelName;
        this.kickId = kickId;
        this.commandList = [
            {
                command: "!bsr",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (platform == Platform.twitch)
                        return;
                    this.twitch.sendMessage(`!bsr ${message}`);
                }
            },
            {
                command: '!tts',
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (platform == Platform.twitch && context != null) {
                        let msg = message.trim();
                        var indexes = [];
                        context.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                        message = removeByIndexToUppercase(message, indexes);
                        let ttsMessage = {
                            text: message,
                            sender: user,
                            emoteOffsets: context.emoteOffsets,
                        };
                        sendTTS(ttsMessage, false);
                    }
                    else if (platform == Platform.kick) {
                        const ttsMessage = {
                            text: parseEmotes(message),
                            sender: user,
                        };
                        sendTTS(ttsMessage, false);
                    }
                }
            },
            {
                command: '!modtts',
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    if (platform == Platform.twitch && context != null) {
                        let msg = message.trim();
                        var indexes = [];
                        context.emoteOffsets.forEach((emote) => { emote.forEach((index) => { indexes.push(parseInt(index)); }); });
                        message = removeByIndexToUppercase(message, indexes);
                        let ttsMessage = {
                            text: message,
                            sender: user,
                            emoteOffsets: context.emoteOffsets,
                        };
                        sendTTS(ttsMessage, true);
                    }
                    else if (platform == Platform.kick) {
                        const ttsMessage = {
                            text: parseEmotes(message),
                            sender: user,
                        };
                        sendTTS(ttsMessage, true);
                    }
                }
            },
        ];
        this.twitch = new twitch_1.Twitch(this.channelName, this.commandList);
        this.twitch.initBot().then(() => {
            this.kick = new kick_1.Kick(this.kickId, this.commandList);
        });
    }
}
exports.TalkingBot = TalkingBot;
