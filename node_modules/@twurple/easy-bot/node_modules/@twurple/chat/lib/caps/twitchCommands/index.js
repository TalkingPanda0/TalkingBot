"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitchCommandsCapability = void 0;
const ClearChat_1 = require("./messageTypes/ClearChat");
const Reconnect_1 = require("./messageTypes/Reconnect");
const RoomState_1 = require("./messageTypes/RoomState");
const UserNotice_1 = require("./messageTypes/UserNotice");
const UserState_1 = require("./messageTypes/UserState");
const Whisper_1 = require("./messageTypes/Whisper");
/** @internal */
exports.TwitchCommandsCapability = {
    name: 'twitch.tv/commands',
    messageTypes: [ClearChat_1.ClearChat, Reconnect_1.Reconnect, RoomState_1.RoomState, UserNotice_1.UserNotice, UserState_1.UserState, Whisper_1.Whisper],
};
