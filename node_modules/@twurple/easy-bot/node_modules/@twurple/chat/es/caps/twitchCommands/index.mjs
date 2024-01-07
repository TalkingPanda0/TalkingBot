import { ClearChat } from "./messageTypes/ClearChat.mjs";
import { Reconnect } from "./messageTypes/Reconnect.mjs";
import { RoomState } from "./messageTypes/RoomState.mjs";
import { UserNotice } from "./messageTypes/UserNotice.mjs";
import { UserState } from "./messageTypes/UserState.mjs";
import { Whisper } from "./messageTypes/Whisper.mjs";
/** @internal */
export const TwitchCommandsCapability = {
    name: 'twitch.tv/commands',
    messageTypes: [ClearChat, Reconnect, RoomState, UserNotice, UserState, Whisper],
};
