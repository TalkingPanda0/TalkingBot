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
exports.TalkingBot = exports.getSuffix = exports.replaceAsync = exports.Platform = void 0;
const twitch_1 = require("./twitch");
const kick_1 = require("./kick");
const stars_1 = require("./stars");
const node_fs_1 = __importStar(require("node:fs"));
const socket_io_1 = require("socket.io");
const kickEmotePrefix = /sweetbabooo-o/g;
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
function replaceAsync(str, regex, asyncFn) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        str.replace(regex, (full, ...args) => {
            promises.push(asyncFn(full, ...args));
            return full;
        });
        const data = yield Promise.all(promises);
        return str.replace(regex, () => data.shift());
    });
}
exports.replaceAsync = replaceAsync;
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
        return name;
    })
        .replace(kickEmotePrefix, "");
}
function getSuffix(i) {
    var j = i % 10, k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
exports.getSuffix = getSuffix;
class TalkingBot {
    readCustomCommands() {
        if (!(0, node_fs_1.existsSync)("./commands.json"))
            return;
        this.customCommands = JSON.parse(node_fs_1.default.readFileSync("./commands.json", "utf-8"));
    }
    writeCustomCommands() {
        node_fs_1.default.writeFileSync("./commands.json", JSON.stringify(this.customCommands), "utf-8");
    }
    constructor(kickId, server) {
        this.commandList = [];
        this.customCommands = [];
        this.counter = 0;
        this.ttsEnabled = false;
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
        this.ioalert = new socket_io_1.Server(this.server, {
            path: "/alerts/",
        });
        this.kickId = kickId;
        this.readCustomCommands();
        this.commandList = [
            {
                showOnChat: false,
                command: "!dyntitle",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    if (message == "stop") {
                        clearInterval(this.dynamicTitleInterval);
                        reply("Stopped dynamic title", true);
                    }
                    else {
                        this.dynamicTitle = message;
                        this.setDynamicTitle();
                        this.dynamicTitleInterval = setInterval(this.setDynamicTitle.bind(this), 1000 * 60);
                        if (this.dynamicTitleInterval != null) {
                            reply("Started dynamic title", true);
                        }
                    }
                },
            },
            {
                showOnChat: false,
                command: "!redeem",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    if (this.twitch.redeemQueue.length == 0) {
                        reply("No redeem found", true);
                        return;
                    }
                    switch (message) {
                        case "accept":
                            this.twitch.handleRedeemQueue(true);
                            break;
                        case "deny":
                            this.twitch.handleRedeemQueue(false);
                            break;
                        case "scam":
                            this.twitch.handleRedeemQueue(null);
                            break;
                        default:
                            reply("Usage: !redeem accept/deny", true);
                            break;
                    }
                },
            },
            {
                showOnChat: false,
                command: "!counter",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    const regex = /[+|-]/g;
                    if (isUserMod && message != "") {
                        if (regex.test(message)) {
                            this.counter += parseInt(message);
                        }
                        else {
                            this.counter = parseInt(message);
                        }
                        reply(`The counter has been set to ${this.counter}`, true);
                        return;
                    }
                    reply(`The counter is at ${this.counter}`, true);
                },
            },
            {
                showOnChat: false,
                command: "!uptime",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (platform == Platform.kick)
                        return;
                    const stream = yield this.twitch.apiClient.streams.getStreamByUserId(this.twitch.channel.id);
                    if (stream == null) {
                        reply(`${this.twitch.channel.displayName} is currently offline`, true);
                        return;
                    }
                    const time = getTimeDifference(stream.startDate, new Date());
                    let timeString = "";
                    if (time.years != 0)
                        timeString += `${time.years} years `;
                    if (time.months != 0)
                        timeString += `${time.months} months `;
                    if (time.days != 0)
                        timeString += `${time.days} days `;
                    if (time.hours != 0)
                        timeString += `${time.hours} hours `;
                    if (time.minutes != 0)
                        timeString += `${time.minutes} minutes`;
                    reply(`${this.twitch.channel.displayName} has been live for ${timeString}`, true);
                }),
            },
            {
                showOnChat: false,
                command: "!status",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (platform == Platform.kick)
                        return;
                    const stream = yield this.twitch.apiClient.streams.getStreamByUserId(this.twitch.channel.id);
                    if (stream == null) {
                        reply(`${this.twitch.channel.displayName} is currently offline`, true);
                        return;
                    }
                    reply(`\"${stream.title}\" - \"${stream.gameName}\"`, true);
                }),
            },
            {
                showOnChat: false,
                command: "!followage",
                commandFunction: (user, isUserMod, message, reply, platform, context) => __awaiter(this, void 0, void 0, function* () {
                    if (platform == Platform.kick)
                        return;
                    const followed = yield this.twitch.apiClient.channels.getChannelFollowers(this.twitch.channel.id, context.userInfo.userId);
                    // User is not following
                    if (followed.data.length == 0) {
                        reply(`You are not following ${this.twitch.channel.displayName}`, true);
                    }
                    else {
                        const time = getTimeDifference(followed.data[0].followDate, new Date());
                        let timeString = "";
                        if (time.years != 0)
                            timeString += `${time.years} years `;
                        if (time.months != 0)
                            timeString += `${time.months} months `;
                        if (time.days != 0)
                            timeString += `${time.days} days `;
                        if (time.hours != 0)
                            timeString += `${time.hours} hours `;
                        if (time.minutes != 0)
                            timeString += `${time.minutes} minutes`;
                        reply(`@${user} has been following ${this.twitch.channel.displayName} for ${timeString}`, false);
                    }
                }),
            },
            {
                showOnChat: false,
                command: "!addcmd",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    const splitMessage = message.split(" ");
                    let commandName = splitMessage[0];
                    const response = message.substring(message.indexOf(" ") + 1, message.length);
                    if (!commandName.startsWith("!"))
                        commandName = `!${commandName}`;
                    const customCom = {
                        command: commandName,
                        response: response,
                    };
                    if (this.customCommands.some((element) => element.command == commandName)) {
                        reply(`Command ${commandName} already exists!`, true);
                        return;
                    }
                    if (splitMessage.length <= 1) {
                        reply("No command response given", true);
                        return;
                    }
                    this.customCommands.push(customCom);
                    reply(`Command ${commandName} has been added`, true);
                    this.writeCustomCommands();
                },
            },
            {
                showOnChat: false,
                command: "!delcmd",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    const oldLen = this.customCommands.length;
                    const commandName = message.split(" ")[0];
                    this.customCommands = this.customCommands.filter((element) => element.command != commandName);
                    if (oldLen != this.customCommands.length) {
                        reply(`${commandName} has been removed`, true);
                        this.writeCustomCommands();
                    }
                    else {
                        reply(`${commandName} is not a command`, true);
                    }
                },
            },
            {
                showOnChat: false,
                command: "!editcmd",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    const commandName = message.split(" ")[0];
                    const response = message.substring(message.indexOf(" ") + 1, message.length);
                    for (let i = 0; i < this.customCommands.length; i++) {
                        const command = this.customCommands[i];
                        if (command.command == commandName) {
                            command.response = response;
                            reply(`command ${commandName} has been edited`, true);
                            this.writeCustomCommands();
                            return;
                        }
                    }
                    reply(`${commandName} is not a command`, true);
                },
            },
            {
                showOnChat: false,
                command: "!aliascmd",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    const splitMessage = message.split(" ");
                    const commandName = splitMessage[1];
                    const newCommand = splitMessage[0];
                    if (this.customCommands.some((element) => element.command == newCommand)) {
                        reply(`${newCommand} already exists`, true);
                        return;
                    }
                    for (let i = 0; i < this.customCommands.length; i++) {
                        const command = this.customCommands[i];
                        if (command.command == commandName) {
                            this.customCommands.push({
                                command: newCommand,
                                response: command.response,
                            });
                            reply(`command ${newCommand} has been aliased to ${command.command}`, true);
                            this.writeCustomCommands();
                            return;
                        }
                    }
                    reply(`${commandName} is not a command`, true);
                },
            },
            {
                showOnChat: false,
                command: "!listcmd",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    const custom = this.customCommands
                        .map((obj) => obj.command)
                        .join(", ");
                    const builtin = this.commandList.map((obj) => obj.command).join(", ");
                    reply(`Builtin Commands: ${builtin}, Custom Commands: ${custom}`, true);
                },
            },
            {
                showOnChat: false,
                command: "!distance",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    const distance = parseInt(message);
                    const distanceinkm = Math.round(distance / 10) / 100;
                    const star = (0, stars_1.findClosestStar)((0, stars_1.metersToSolarRadii)(distance));
                    const diameter = (0, stars_1.solarRadiiToMeter)(star.radius * 2);
                    const diameterinkm = Math.round(diameter / 10) / 100;
                    const percent = Math.round((distanceinkm / diameterinkm) * 10000) / 100;
                    reply(`${star.name}: ${distanceinkm}/${diameterinkm} km (${percent}%) `, true);
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
            /*{
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
                reply(
                  "SweetbabooO_o's socials: https://linktr.ee/SweetbabooO_o",
                  true,
                );
              },
            },
            {
              showOnChat: false,
              command: "!yt",
              commandFunction(user, isUserMod, message, reply, platform, context) {
                reply(
                  "SweetbabooO_o's Youtube channel: https://www.youtube.com/channel/UC1dRtHovRsOwq2qSComV_OQ",
                  true,
                );
              },
            },
            {
              showOnChat: false,
              command: "!twitch",
              commandFunction(user, isUserMod, message, reply, platform, context) {
                reply(
                  "SweetbabooO_o's Twitch channel: https://www.twitch.tv/sweetbabooo_o",
                  true,
                );
              },
            },
            {
              showOnChat: false,
              command: "!kick",
              commandFunction(user, isUserMod, message, reply, platform, context) {
                reply(
                  "SweetbabooO_o's Kick channel: https://kick.com/sweetbabooo-o/",
                  true,
                );
              },
            },*/
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
                    if (!isUserMod && !this.ttsEnabled)
                        return;
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
                        this.sendTTS(ttsMessage);
                    }
                    else if (platform == Platform.kick) {
                        const ttsMessage = {
                            text: removeKickEmotes(message),
                            sender: user,
                        };
                        this.sendTTS(ttsMessage);
                    }
                },
            },
            {
                showOnChat: false,
                command: "!modtts",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    if (message == "enable") {
                        this.ttsEnabled = true;
                        return;
                    }
                    if (message == "disable") {
                        this.ttsEnabled = false;
                        return;
                    }
                },
            },
        ];
        this.twitch = new twitch_1.Twitch(this);
        this.kick = new kick_1.Kick(this.kickId, this);
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
    sendTTS(message) {
        this.iotts.emit("message", message);
    }
    setDynamicTitle() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dynamicTitle == null)
                return;
            const title = (yield replaceAsync(this.dynamicTitle, /(!?fetch)\[([^]+)\]{?(\w+)?}?/g, (message, command, url, key) => __awaiter(this, void 0, void 0, function* () {
                const req = yield fetch(url);
                if (key === undefined) {
                    return yield req.text();
                }
                else {
                    const json = yield req.json();
                    return json[key];
                }
            }))).replace(/suffix\((\d+)\)/g, (message, number) => {
                return getSuffix(parseInt(number));
            });
            if (title != this.lastDynamicTitle) {
                this.twitch.chatClient.say(this.twitch.channel.name, `Title has been set to ${title}`);
                this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, {
                    title: title,
                });
                this.lastDynamicTitle = title;
            }
        });
    }
}
exports.TalkingBot = TalkingBot;
