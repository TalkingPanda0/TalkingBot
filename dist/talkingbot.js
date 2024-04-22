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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalkingBot = exports.getSuffix = exports.replaceAsync = exports.Platform = void 0;
const twitch_1 = require("./twitch");
const discord_1 = require("./discord");
const youtube_1 = require("./youtube");
const kick_1 = require("./kick");
const stars_1 = require("./stars");
const node_fs_1 = __importStar(require("node:fs"));
const socket_io_1 = require("socket.io");
const kickEmotePrefix = /sweetbabooo-o/g;
var Platform;
(function (Platform) {
    Platform[Platform["twitch"] = 0] = "twitch";
    Platform[Platform["kick"] = 1] = "kick";
    Platform[Platform["youtube"] = 2] = "youtube";
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
async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (full, ...args) => {
        promises.push(asyncFn(full, ...args));
        return full;
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
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
        console.log(`${match} ${id} ${name}`);
        return name + " ";
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
function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
const selfKillMessages = [
    "$1 managed to kill themself.",
    "$1 died from an unknown cause.",
    "$1 was crushed by a boulder, or some piece of debris.",
    "$1 exploded.",
    "$1 forgot how to breathe.",
    "$1 learned that cellular respiration uses oxygen, not sand.",
    "$1 died.",
    "$1 tried to befriend a wild grizzly bear.",
    "$1 suffocated.",
    "$1 tested the bounds of time and space, and lost.",
    "$1 imploded.",
    "$1 drowned.",
    "$1 ceased to be.",
    "$1 went kablewy!",
    "$1 figured out how to divide by 0!",
    "$1 took a long walk off a short pier.",
    "$1 fell off a ladder.",
    "$1 fell off a tree.",
    "$1 fell off of the roof.",
    "$1 burst into flames.",
    "$1 was struck by lightning.",
    "$1 starved to death.",
    "$1 was stabbed to death.",
    "$1 fell victim to gravity.",
    "$1's plead for death was answered.",
    "$1's vital organs were ruptured.",
    "$1's innards were made outwards.",
    "$1 was licked to death. Don't ask.",
    "$1 was deleted.",
    "$1 had to split. Literally..",
    "$1 has bled to death.",
    "$1 Food is a gift from God. Spices are a gift from the devil. I guess it was a little too spicy for you.",
    "$1 has died due to a vehicular explosion!",
    "$1 has killed themself!",
    "$1 has been blown up by a landmine!",
    "$1 died due to holding their breath for too long!",
    "$1 burned to death.",
    "$1 was blown up by a missile!",
    "$1 froze to death.",
    "$1 was dissolved in acid.",
    "$1 tried to swim in acid.",
    "$1 tried to swim in lava.",
    "$1 experienced kinetic energy.",
    "$1 blew up.",
    "$1 fell into a patch of fire.",
    "$1 fell out of a plane.",
    "$1 went up in flames.",
    "$1 withered away.",
    "$1 went skydiving, and forgot the parachute.",
    "$1 spontaneously combusted.",
    "$1 was struck with a bolt of inspiration, I mean lightning.",
    "$1 ended it all. Goodbye cruel world!",
    "$1 passed the event horizon.",
];
const killOtherMessages = [
    "$1 murdered $2 with a unicorn's horn!",
    "$2 was killed by $1!",
    "$2 was mauled by $1 dressed up as a chicken.",
    "$2 was ripped apart by $1, daaaaaaamn!",
    "$2 was brutally murdered by $1 with a car!",
    "$1 covered $2 in meat sauce and threw them in a cage with a starved tiger.",
    "$1 genetically modified a Venus flytrap to grow abnormally large, and trapped $2 in a room with it.",
    "$1 shanked $2's butt, over and over again.",
    "$1 just wrote $2's name in their Death Note.",
    "$1 put $2 out of their misery.",
    "$1 destroyed $2!",
    "$1 atacó a $2 con un consolador grande!",
    "$2 was poked a bit too hard by $1 with a spork!",
    "ZA WARUDO! $1 stopped time and throw hundreds of knives at $2. END!",
    "$1 attacked $2 with a rusty spork...and managed to kill $2 with very little effort.",
    "$1 stole a car known as 'KITT' and ran over $2.",
    "$1 tickled $2 to death!",
    "$2's skull was crushed by $1!",
    "$2 is in several pieces after a tragic accident involving $1 and cutlery.",
    "$1 licked $2 until $2 was squishy, yeah.. squishy.",
    "$1 catapulted a huge load of rusty sporks on to $2. $2 died.",
    "$1 ran out of rusty sporks and unicorn horns to kill $2 with, so instead they used a rusty hanger.",
    "$1 came in like a mystical being of awesomeness and destroyed $2!",
    "$2 drowned whilst trying to escape from $1",
    "$2 walked into a cactus while running from $1",
    "$2 was attacked by $1 behind a Taco Bell.",
    "$1 went back in time to prevent himself from killing $2, apparently the time machine landed on $2 when $1 jumped back in time.",
    "$1 rekt $2 30-4 by doing a 360 no-scope.",
    "$1 struck the final blow and ended $2.",
    "$1 tried to kill $2 with a unicorn's horn, but police showed up before $1 had time.",
    "$1 tried to murder $2, but swat was hiding in the bushes and jumped on $1 before it could be done.",
    "$1 was going to hit $2 with a hammer. However $2 was trained in the Secret Nippon Arts!",
    "$1 attacked $2 with a plastic spoon, but then suddenly a swarm of police surrounded $1 and detained them.",
    "$2 is protected by an unknown force which repels $1.",
    "$1 was justly ended by $2.",
    "$1 was blown up by $2.",
    "$1 was shot off a ladder by $2.",
    "$1 tried to swim in lava while trying to escape $2.",
    "$1 got finished off by $2.",
    "$1 delivered the fatal blow on $2.",
    "$1 has punched $2 to death.",
    "$1 ruffled $2's fluff, and died!",
    "$1 hugged $2 a little too tight.",
    "$1 sent $2 to an awesome farm in the country.",
];
const eightballMessages = [
    "Reply hazy try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Go for it!",
    "Yes, in due time.",
    "You will have to wait.",
    "Ask again later.",
    "Yeah, for sure.",
    "Concentrate and ask again.",
    "Probably.",
    "Never going to happen!",
    "The odds of that happening are pretty slim.",
    "My reply is no.",
    "My sources say no.",
    "Very doubtful.",
    "No.",
    "I have no response for that question...",
    "Why would I tell you?",
    "Forget about it.",
    "Don't bet on it.",
    "Who knows?",
    "Signs point to yes.",
    "It is certain.",
    "Without a doubt.",
    "Yes definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "This is not the Bot you're looking for ༼ﾉ۞⌂۞༽ﾉ",
    "There's a pretty good chance.",
    "No, don't even think about.",
];
class TalkingBot {
    discord;
    twitch;
    youTube;
    kick;
    iochat;
    iomodtext;
    iopoll;
    ioalert;
    commandList = [];
    customCommands = [];
    aliasCommands = [];
    kickId;
    modtext;
    counter = 0;
    ttsEnabled = false;
    server;
    iotts;
    dynamicTitle;
    dynamicTitleInterval;
    lastDynamicTitle;
    readCustomCommands() {
        if (!(0, node_fs_1.existsSync)("./commands.json"))
            return;
        this.customCommands = JSON.parse(node_fs_1.default.readFileSync("./commands.json", "utf-8"));
        if (!(0, node_fs_1.existsSync)("./aliases.json"))
            return;
        this.aliasCommands = JSON.parse(node_fs_1.default.readFileSync("./aliases.json", "utf-8"));
    }
    writeCustomCommands() {
        node_fs_1.default.writeFileSync("./commands.json", JSON.stringify(this.customCommands), "utf-8");
        node_fs_1.default.writeFileSync("./aliases.json", JSON.stringify(this.aliasCommands), "utf-8");
    }
    constructor(kickId, server) {
        this.server = server;
        this.iomodtext = new socket_io_1.Server(this.server, {
            path: "/modtext/",
        });
        this.iomodtext.on("connection", (socket) => {
            socket.emit("message", this.modtext);
        });
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
                command: "!8ball",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (message.toLowerCase().includes("furry")) {
                        reply("Yes.", false);
                        return;
                    }
                    reply(getRandomElement(eightballMessages), false);
                },
            },
            {
                showOnChat: false,
                command: "!kill",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (message === "" || message === undefined) {
                        reply(getRandomElement(selfKillMessages).replaceAll("$1", user), false);
                    }
                    else {
                        reply(getRandomElement(killOtherMessages)
                            .replaceAll("$1", user)
                            .replaceAll("$2", message), false);
                    }
                },
            },
            {
                showOnChat: false,
                command: "!modtext",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    if (platform == Platform.twitch) {
                        message = (0, twitch_1.parseTwitchEmotes)("!modtext " + message, context.emoteOffsets);
                        message = message.replace("!modtext", "");
                    }
                    else if (platform == Platform.kick) {
                        message = (0, kick_1.parseKickEmotes)(message);
                    }
                    this.modtext = message;
                    this.iomodtext.emit("message", message);
                },
            },
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
                commandFunction: async (user, isUserMod, message, reply, platform, context) => {
                    if (platform != Platform.twitch)
                        return;
                    const stream = await this.twitch.apiClient.streams.getStreamByUserId(this.twitch.channel.id);
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
                },
            },
            {
                showOnChat: false,
                command: "!status",
                commandFunction: async (user, isUserMod, message, reply, platform, context) => {
                    if (platform != Platform.twitch)
                        return;
                    const stream = await this.twitch.apiClient.streams.getStreamByUserId(this.twitch.channel.id);
                    if (stream == null) {
                        reply(`${this.twitch.channel.displayName} is currently offline`, true);
                        return;
                    }
                    reply(`\"${stream.title}\" - \"${stream.gameName}\"`, true);
                },
            },
            {
                showOnChat: false,
                command: "!followage",
                commandFunction: async (user, isUserMod, message, reply, platform, context) => {
                    if (platform != Platform.twitch)
                        return;
                    const followed = await this.twitch.apiClient.channels.getChannelFollowers(this.twitch.channel.id, context.userInfo.userId);
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
                },
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
                command: "!showcmd",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    const splitMessage = message.split(" ");
                    let commandName = splitMessage[0];
                    if (!commandName.startsWith("!"))
                        commandName = `!${commandName}`;
                    const command = this.customCommands.filter((element) => element.command == commandName);
                    if (command) {
                        reply(`${command[0].command}: ${command[0].response}`, true);
                        return;
                    }
                    else {
                        reply(`Command ${commandName} doesn't exist!`, true);
                        return;
                    }
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
                command: "!delalias",
                commandFunction: (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    const oldLen = this.aliasCommands.length;
                    const alias = message.split(" ")[0];
                    this.aliasCommands = this.aliasCommands.filter((element) => element.alias != alias);
                    if (oldLen != this.aliasCommands.length) {
                        reply(`${alias} has been removed`, true);
                        this.writeCustomCommands();
                    }
                    else {
                        reply(`${alias} is not an alias`, true);
                    }
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
                    const alias = splitMessage[0];
                    if (this.customCommands.some((element) => element.command == alias)) {
                        reply(`${alias} already exists`, true);
                        return;
                    }
                    this.aliasCommands.push({ command: commandName, alias: alias });
                    reply(`command ${commandName} has been aliased to ${alias}`, true);
                    this.writeCustomCommands();
                    return;
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
                commandFunction: async (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod || message.length == 0)
                        return;
                    await this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, { title: message });
                    // TODO change title in kick
                    reply(`Title has been changed to "${message}"`, true);
                },
            },
            {
                showOnChat: false,
                command: "!setgame",
                commandFunction: async (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod || message.length == 0)
                        return;
                    const game = await this.twitch.apiClient.games.getGameByName(message);
                    if (game == null) {
                        reply(`Can't find game "${message}"`, true);
                        return;
                    }
                    await this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, { gameId: game.id });
                    // TODO change game in kick
                    reply(`Game has been changed to "${game.name}"`, true);
                },
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
                    switch (platform) {
                        case Platform.twitch:
                            if (context == null)
                                break;
                            let msg = message.trim();
                            var indexes = [];
                            context.emoteOffsets.forEach((emote) => {
                                emote.forEach((index) => {
                                    indexes.push(parseInt(index) - "!tts ".length);
                                });
                            });
                            msg = removeByIndexToUppercase(msg, indexes);
                            this.sendTTS({ text: msg, sender: user });
                            break;
                        case Platform.kick:
                            this.sendTTS({ text: removeKickEmotes(message), sender: user });
                            break;
                        default:
                            this.sendTTS({ text: message, sender: user });
                            break;
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
            {
                showOnChat: false,
                command: "!clip",
                commandFunction: async (user, isUserMod, message, reply, platform, context) => {
                    if (!isUserMod)
                        return;
                    reply(await this.twitch.apiClient.clips.createClip({
                        channel: this.twitch.channel.id,
                        createAfterDelay: true,
                    }), true);
                },
            },
        ];
        this.twitch = new twitch_1.Twitch(this);
        this.kick = new kick_1.Kick(this.kickId, this);
        this.youTube = new youtube_1.YouTube("sweetbaboostreams1351", this);
        this.discord = new discord_1.Discord();
    }
    initBot() {
        this.discord.initBot();
        this.youTube.initBot();
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
    async setDynamicTitle() {
        if (this.dynamicTitle == null)
            return;
        const title = (await replaceAsync(this.dynamicTitle, /(!?fetch)\[([^]+)\]{?(\w+)?}?/g, async (message, command, url, key) => {
            const req = await fetch(url);
            if (key === undefined) {
                return await req.text();
            }
            else {
                const json = await req.json();
                return json[key];
            }
        })).replace(/suffix\((\d+)\)/g, (message, number) => {
            return getSuffix(parseInt(number));
        });
        if (title != this.lastDynamicTitle) {
            this.twitch.chatClient.say(this.twitch.channel.name, `Title has been set to ${title}`);
            this.twitch.apiClient.channels.updateChannelInfo(this.twitch.channel.id, {
                title: title,
            });
            this.lastDynamicTitle = title;
        }
    }
}
exports.TalkingBot = TalkingBot;
