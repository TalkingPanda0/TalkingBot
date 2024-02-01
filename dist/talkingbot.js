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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalkingBot = exports.Platform = void 0;
const twitch_1 = require("./twitch");
const kick_1 = require("./kick");
const stars_1 = require("./stars");
const node_fs_1 = __importDefault(require("node:fs"));
const socket_io_1 = require("socket.io");
var Platform;
(function (Platform) {
    Platform[Platform["twitch"] = 0] = "twitch";
    Platform[Platform["kick"] = 1] = "kick";
})(Platform || (exports.Platform = Platform = {}));
function getTimeDifference(startDate, endDate) {
    const timeDifference = endDate.getTime() - startDate.getTime();
    const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365.25));
    const remainingTime = timeDifference % (1000 * 60 * 60 * 24 * 365.25);
    const months = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30.44));
    const remainingTime2 = remainingTime % (1000 * 60 * 60 * 24 * 30.44);
    const days = Math.floor(remainingTime2 / (1000 * 60 * 60 * 24));
    const remainingTime3 = remainingTime2 % (1000 * 60 * 60 * 24);
    const hours = Math.floor(remainingTime3 / (1000 * 60 * 60));
    const remainingTime4 = remainingTime3 % (1000 * 60 * 60);
    const minutes = Math.floor(remainingTime4 / (1000 * 60));
    return {
        years,
        months,
        days,
        hours,
        minutes,
    };
}
function removeByIndex(str, index) {
    return str.slice(0, index) + str.slice(index + 1);
}
function removeByIndexToUppercase(str, indexes) {
    let deletedChars = 0;
    indexes.forEach((index) => {
        let i = index - deletedChars;
        while (!isNaN(parseInt(str.charAt(i), 10)) ||
            str.charAt(i) !== str.charAt(i).toUpperCase()) {
            str = removeByIndex(str, i);
            deletedChars++;
        }
    });
    return str;
}
function removeKickEmotes(message) {
    const regex = /\[emote:(\d+):([^\]]+)\]/g;
    return message
        .replace(regex, (match, id, name) => {
        console.log(match);
        console.log(id);
        return name;
    })
        .replace("sweetbabooo-o", "");
}
class TalkingBot {
    constructor(kickId, server) {
        this.commandList = [];
        this.ttsEnabled = true;
        this.server = server;
        this.iotts = new socket_io_1.Server(this.server, {
            path: "/tts/",
        });
        this.iochat = new socket_io_1.Server(this.server, {
            path: "/chat/",
        });
        this.iopoll = new socket_io_1.Server(this.server, {
            path: "/poll/",
        });
        this.kickId = kickId;
        this.commandList = [
            {
                showOnChat: false,
                command: "!followage",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (platform == Platform.kick)
                        return;
                    const followed = yield this.twitch.apiClient.channels.getChannelFollowers(this.twitch.channel.id, context.userInfo.userId);
                    // User is not following
                    if (followed.data.length == 0) {
                        console.log("a");
                        reply(`You are not following ${this.twitch.channel.displayName}`, true);
                    }
                    else {
                        const time = getTimeDifference(followed.data[0].followDate, new Date());
                        let timeString = "";
                        if (time.years != 0)
                            timeString += `${time.years} years`;
                        if (time.months != 0)
                            timeString += `${time.months} months`;
                        if (time.days != 0)
                            timeString += `${time.days} days`;
                        if (time.minutes != 0)
                            timeString += `${time.minutes} minutes`;
                        reply(`@${user} has been following ${this.twitch.channel.displayName} for ${timeString}`, false);
                    }
                }),
            },
            {
                showOnChat: false,
                command: "!lurk",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    reply(`@${user} is now lurking at the bottom of the fish tank`, false);
                },
            },
            {
                showOnChat: false,
                command: "!distance",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    const playerData = JSON.parse(node_fs_1.default.readFileSync(this.twitch.dataPath, "utf-8"));
                    const distance = playerData.localPlayers[0].playerAllOverallStatsData
                        .soloFreePlayOverallStatsData.handDistanceTravelled;
                    const distanceinkm = Math.round(distance / 10) / 100;
                    const distanceinSolar = (0, stars_1.metersToSolarRadii)(distance);
                    const star = (0, stars_1.findClosestStar)((0, stars_1.metersToSolarRadii)(distance));
                    const diameter = (0, stars_1.solarRadiiToMeter)(star.radius * 2);
                    const diameterinkm = Math.round(diameter / 10) / 100;
                    const percent = Math.round((distanceinkm / diameterinkm) * 10000) / 100;
                    console.log(`${distance},${distanceinkm},${distanceinSolar},${star},${diameter},${diameterinkm},${percent}`);
                    reply(`${star.name}: ${distanceinkm}/${diameterinkm} km (${percent}%) `, true);
                },
            },
            {
                showOnChat: false,
                command: "!fsog",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let response = yield fetch("https://talkingpanda.dev/fsog");
                            reply(`SweetbabooO_o currently has ${yield response.text()} on furry shades of gay`, true);
                        }
                        catch (_a) {
                            reply("Failed getting data", true);
                        }
                    });
                },
            },
            {
                showOnChat: false,
                command: "!settitle",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (!isUserMod || message.length == 0)
                        return;
                    yield this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, { title: message });
                    // TODO change title in kick
                    reply(`Title has been changed to "${message}"`, true);
                }),
            },
            {
                showOnChat: false,
                command: "!setgame",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (!isUserMod || message.length == 0)
                        return;
                    const game = yield this.twitch.apiClient.games.getGameByName(message);
                    if (game == null) {
                        reply(`Can't find game "${message}"`, true);
                        return;
                    }
                    yield this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, { gameId: game.id });
                    // TODO change game in kick
                    reply(`Game has been changed to "${game.name}"`, true);
                }),
            },
            {
                showOnChat: false,
                command: "!adopt",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply(`${message} has been adopted by @${user}!`, true);
                },
            },
            {
                showOnChat: false,
                command: "!socials",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's socials: https://linktr.ee/SweetbabooO_o", true);
                },
            },
            {
                showOnChat: false,
                command: "!yt",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's Youtube channel: https://www.youtube.com/channel/UC1dRtHovRsOwq2qSComV_OQ", true);
                },
            },
            {
                showOnChat: false,
                command: "!twitch",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's Twitch channel: https://www.twitch.tv/sweetbabooo_o", true);
                },
            },
            {
                showOnChat: false,
                command: "!kick",
                commandFunction(user, isUserMod, message, reply, platform, context) {
                    reply("SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o/", true);
                },
            },
            {
                showOnChat: false,
                command: "!bsr",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (platform == Platform.twitch)
                        return;
                    this.twitch.chatClient.say(this.twitch.channel.name, `!bsr ${message}`);
                },
            },
            {
                showOnChat: true,
                command: "!tts",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (platform == Platform.twitch && context != null) {
                        let msg = message.trim();
                        var indexes = [];
                        context.emoteOffsets.forEach((emote) => {
                            emote.forEach((index) => {
                                indexes.push(parseInt(index) - "!tts ".length);
                            });
                        });
                        msg = removeByIndexToUppercase(msg, indexes);
                        let ttsMessage = {
                            text: msg,
                            sender: user,
                        };
                        this.sendTTS(ttsMessage, false);
                    }
                    else if (platform == Platform.kick) {
                        const ttsMessage = {
                            text: removeKickEmotes(message),
                            sender: user,
                        };
                        this.sendTTS(ttsMessage, false);
                    }
                },
            },
            {
                showOnChat: true,
                command: "!modtts",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    if (platform == Platform.twitch && context != null) {
                        let msg = message.trim();
                        var indexes = [];
                        context.emoteOffsets.forEach((emote) => {
                            emote.forEach((index) => {
                                indexes.push(parseInt(index) - "!modtts ".length);
                            });
                        });
                        msg = removeByIndexToUppercase(msg, indexes);
                        let ttsMessage = {
                            text: msg,
                            sender: user,
                        };
                        this.sendTTS(ttsMessage, true);
                    }
                    else if (platform == Platform.kick) {
                        const ttsMessage = {
                            text: removeKickEmotes(message),
                            sender: user,
                        };
                        this.sendTTS(ttsMessage, true);
                    }
                },
            },
        ];
        this.twitch = new twitch_1.Twitch(this.commandList, this);
        this.kick = new kick_1.Kick(this.kickId, this.commandList, this);
    }
    initBot() {
        this.twitch.initBot().then(() => {
            this.kick.initBot();
        });
    }
    updatePoll() {
        const combinedOptions = {};
        // Add options from poll1 to the combinedOptions
        if (this.kick.currentPoll != null) {
            this.kick.currentPoll.options.forEach((option) => {
                combinedOptions[option.id] = {
                    label: option.label,
                    votes: option.votes,
                };
            });
        }
        // Add or update options from poll2 to the combinedOptions
        //
        if (this.twitch.currentPoll != null) {
            this.twitch.currentPoll.options.forEach((option) => {
                if (combinedOptions.hasOwnProperty(option.id)) {
                    combinedOptions[option.id].votes += option.votes;
                }
                else {
                    combinedOptions[option.id] = {
                        label: option.label,
                        votes: option.votes,
                    };
                }
            });
        }
        // Convert combinedOptions back to an array of options
        const combinedOptionsArray = Object.keys(combinedOptions).map((id) => ({
            id: parseInt(id),
            label: combinedOptions[id].label,
            votes: combinedOptions[id].votes,
        }));
        this.iopoll.emit("updatePoll", combinedOptionsArray);
    }
    sendTTS(message, isMod) {
        if ((!this.ttsEnabled && !isMod) || !message.text || !message.sender) {
            return;
        }
        if (isMod) {
            if (message.text === "enable") {
                this.ttsEnabled = true;
                this.sendTTS({ text: "Enabled TTS command!", sender: "Brian" }, true);
                return;
            }
            else if (message.text === "disable") {
                this.ttsEnabled = false;
                this.sendTTS({ text: "disabled TTS command!", sender: "Brian" }, true);
                return;
            }
        }
        this.iotts.emit("message", message);
    }
}
exports.TalkingBot = TalkingBot;
