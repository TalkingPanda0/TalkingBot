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
                command: "!fsog",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let data = yield fetch("https://talkingpanda.dev/fsog");
                            reply(`SweetbabooO_o currently has ${yield data.text()} on furry shades of gay`);
                        }
                        catch (_a) {
                            reply('Failed getting data');
                        }
                    });
                },
            },
            {
                command: "!settitle",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (!isUserMod || message.length == 0)
                        return;
                    yield this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, { title: message });
                    // TODO change title in kick
                    reply(`Title has been changed to "${message}"`);
                }),
            },
            {
                command: "!setgame",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (!isUserMod || message.length == 0)
                        return;
                    const game = yield this.twitch.apiClient.games.getGameByName(message);
                    if (game == null) {
                        reply(`Can't find game "${message}"`);
                        return;
                    }
                    yield this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, { gameId: game.id });
                    // TODO change game in kick
                    reply(`Game has been changed to "${game.name}"`);
                }),
            },
            {
                command: "!adopt",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply(`${message} has been adopted by @${user}!`);
                },
            },
            {
                command: "!socials",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's socials: https://linktr.ee/SweetbabooO_o");
                },
            },
            {
                command: "!yt",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's Youtube channel: https://www.youtube.com/channel/UC1dRtHovRsOwq2qSComV_OQ");
                },
            },
            {
                command: "!twitch",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's Twitch channel: https://www.twitch.tv/sweetbabooo_o");
                },
            },
            {
                command: "!kick",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o/");
                },
            },
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
        this.kick = new kick_1.Kick(this.kickId, this.commandList);
    }
    initBot() {
        this.twitch.initBot().then(() => {
            this.kick.initBot();
        });
    }
}
exports.TalkingBot = TalkingBot;
