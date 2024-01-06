"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Whisper = void 0;
const ircv3_1 = require("ircv3");
const ChatUser_1 = require("../../../ChatUser");
const emoteUtil_1 = require("../../../utils/emoteUtil");
/** @private */
class Whisper extends ircv3_1.Message {
    constructor(command, contents, config) {
        super(command, contents, config, {
            target: {},
            text: { trailing: true },
        });
    }
    get userInfo() {
        return new ChatUser_1.ChatUser(this._prefix.nick, this._tags);
    }
    get emoteOffsets() {
        return (0, emoteUtil_1.parseEmoteOffsets)(this._tags.get('emotes'));
    }
}
Whisper.COMMAND = 'WHISPER';
exports.Whisper = Whisper;
