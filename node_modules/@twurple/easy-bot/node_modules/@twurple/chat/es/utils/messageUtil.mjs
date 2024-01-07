import { decodeCtcp, MessageTypes, parseMessage } from 'ircv3';
import { ClearChat } from "../caps/twitchCommands/messageTypes/ClearChat.mjs";
import { Reconnect } from "../caps/twitchCommands/messageTypes/Reconnect.mjs";
import { RoomState } from "../caps/twitchCommands/messageTypes/RoomState.mjs";
import { UserNotice } from "../caps/twitchCommands/messageTypes/UserNotice.mjs";
import { UserState } from "../caps/twitchCommands/messageTypes/UserState.mjs";
import { Whisper } from "../caps/twitchCommands/messageTypes/Whisper.mjs";
import { ClearMsg } from "../caps/twitchTags/messageTypes/ClearMsg.mjs";
import { GlobalUserState } from "../caps/twitchTags/messageTypes/GlobalUserState.mjs";
import { ChatMessage } from "../commands/ChatMessage.mjs";
let twitchMessageTypesCache = null;
function getTwitchMessageTypes() {
    return (twitchMessageTypesCache !== null && twitchMessageTypesCache !== void 0 ? twitchMessageTypesCache : (twitchMessageTypesCache = new Map([
        // standard types used by Twitch
        ['PRIVMSG', ChatMessage],
        ['NOTICE', MessageTypes.Commands.Notice],
        ['PING', MessageTypes.Commands.Ping],
        ['PONG', MessageTypes.Commands.Pong],
        ['JOIN', MessageTypes.Commands.ChannelJoin],
        ['PART', MessageTypes.Commands.ChannelPart],
        ['NICK', MessageTypes.Commands.NickChange],
        ['PASS', MessageTypes.Commands.Password],
        ['CAP', MessageTypes.Commands.CapabilityNegotiation],
        ['001', MessageTypes.Numerics.Reply001Welcome],
        ['002', MessageTypes.Numerics.Reply002YourHost],
        ['003', MessageTypes.Numerics.Reply003Created],
        // 004 intentionally left out because not standards-conforming
        ['353', MessageTypes.Numerics.Reply353NamesReply],
        ['366', MessageTypes.Numerics.Reply366EndOfNames],
        ['372', MessageTypes.Numerics.Reply372Motd],
        ['375', MessageTypes.Numerics.Reply375MotdStart],
        ['376', MessageTypes.Numerics.Reply376EndOfMotd],
        // Twitch extensions
        ['CLEARCHAT', ClearChat],
        ['USERSTATE', UserState],
        ['GLOBALUSERSTATE', GlobalUserState],
        ['WHISPER', Whisper],
        ['ROOMSTATE', RoomState],
        ['RECONNECT', Reconnect],
        ['USERNOTICE', UserNotice],
        ['CLEARMSG', ClearMsg],
    ])));
}
/**
 * Parses a raw message from Twitch into a message object.
 *
 * @param rawLine The raw message line.
 */
export function parseTwitchMessage(rawLine) {
    return parseMessage(rawLine, undefined, getTwitchMessageTypes(), true);
}
export function splitOnSpaces(text, maxMsgLength) {
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
/**
 * Extracts the text to show from a message parameter.
 *
 * @param message The message parameter to extract the text from.
 *
 * You would usually get this using `msg.params.message` on a message object.
 */
export function extractMessageText(message) {
    const ctcp = decodeCtcp(message);
    if (ctcp && ctcp.command === 'ACTION') {
        return ctcp.params;
    }
    return message;
}
