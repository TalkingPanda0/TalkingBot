"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMessageText = exports.splitOnSpaces = exports.parseTwitchMessage = void 0;
const ircv3_1 = require("ircv3");
const ClearChat_1 = require("../caps/twitchCommands/messageTypes/ClearChat");
const Reconnect_1 = require("../caps/twitchCommands/messageTypes/Reconnect");
const RoomState_1 = require("../caps/twitchCommands/messageTypes/RoomState");
const UserNotice_1 = require("../caps/twitchCommands/messageTypes/UserNotice");
const UserState_1 = require("../caps/twitchCommands/messageTypes/UserState");
const Whisper_1 = require("../caps/twitchCommands/messageTypes/Whisper");
const ClearMsg_1 = require("../caps/twitchTags/messageTypes/ClearMsg");
const GlobalUserState_1 = require("../caps/twitchTags/messageTypes/GlobalUserState");
const ChatMessage_1 = require("../commands/ChatMessage");
let twitchMessageTypesCache = null;
function getTwitchMessageTypes() {
    return (twitchMessageTypesCache !== null && twitchMessageTypesCache !== void 0 ? twitchMessageTypesCache : (twitchMessageTypesCache = new Map([
        // standard types used by Twitch
        ['PRIVMSG', ChatMessage_1.ChatMessage],
        ['NOTICE', ircv3_1.MessageTypes.Commands.Notice],
        ['PING', ircv3_1.MessageTypes.Commands.Ping],
        ['PONG', ircv3_1.MessageTypes.Commands.Pong],
        ['JOIN', ircv3_1.MessageTypes.Commands.ChannelJoin],
        ['PART', ircv3_1.MessageTypes.Commands.ChannelPart],
        ['NICK', ircv3_1.MessageTypes.Commands.NickChange],
        ['PASS', ircv3_1.MessageTypes.Commands.Password],
        ['CAP', ircv3_1.MessageTypes.Commands.CapabilityNegotiation],
        ['001', ircv3_1.MessageTypes.Numerics.Reply001Welcome],
        ['002', ircv3_1.MessageTypes.Numerics.Reply002YourHost],
        ['003', ircv3_1.MessageTypes.Numerics.Reply003Created],
        // 004 intentionally left out because not standards-conforming
        ['353', ircv3_1.MessageTypes.Numerics.Reply353NamesReply],
        ['366', ircv3_1.MessageTypes.Numerics.Reply366EndOfNames],
        ['372', ircv3_1.MessageTypes.Numerics.Reply372Motd],
        ['375', ircv3_1.MessageTypes.Numerics.Reply375MotdStart],
        ['376', ircv3_1.MessageTypes.Numerics.Reply376EndOfMotd],
        // Twitch extensions
        ['CLEARCHAT', ClearChat_1.ClearChat],
        ['USERSTATE', UserState_1.UserState],
        ['GLOBALUSERSTATE', GlobalUserState_1.GlobalUserState],
        ['WHISPER', Whisper_1.Whisper],
        ['ROOMSTATE', RoomState_1.RoomState],
        ['RECONNECT', Reconnect_1.Reconnect],
        ['USERNOTICE', UserNotice_1.UserNotice],
        ['CLEARMSG', ClearMsg_1.ClearMsg],
    ])));
}
/**
 * Parses a raw message from Twitch into a message object.
 *
 * @param rawLine The raw message line.
 */
function parseTwitchMessage(rawLine) {
    return (0, ircv3_1.parseMessage)(rawLine, undefined, getTwitchMessageTypes(), true);
}
exports.parseTwitchMessage = parseTwitchMessage;
function splitOnSpaces(text, maxMsgLength) {
    if (text.length <= maxMsgLength) {
        return [text];
    }
    text = text.trim();
    const res = [];
    let startIndex = 0;
    let endIndex = maxMsgLength;
    while (startIndex < text.length) {
        let spaceIndex = text.lastIndexOf(' ', endIndex);
        if (spaceIndex === -1 || spaceIndex <= startIndex || text.length - startIndex + 1 <= maxMsgLength) {
            spaceIndex = startIndex + maxMsgLength;
        }
        const textSlice = text.slice(startIndex, spaceIndex).trim();
        if (textSlice.length) {
            res.push(textSlice);
        }
        startIndex = spaceIndex + (text[spaceIndex] === ' ' ? 1 : 0); // to skip the space
        endIndex = startIndex + maxMsgLength;
    }
    return res;
}
exports.splitOnSpaces = splitOnSpaces;
/**
 * Extracts the text to show from a message parameter.
 *
 * @param message The message parameter to extract the text from.
 *
 * You would usually get this using `msg.params.message` on a message object.
 */
function extractMessageText(message) {
    const ctcp = (0, ircv3_1.decodeCtcp)(message);
    if (ctcp && ctcp.command === 'ACTION') {
        return ctcp.params;
    }
    return message;
}
exports.extractMessageText = extractMessageText;
