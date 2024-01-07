import { Message } from 'ircv3';
import { ChatUser } from "../../../ChatUser.mjs";
import { parseEmoteOffsets } from "../../../utils/emoteUtil.mjs";
/** @private */
class Whisper extends Message {
    constructor(command, contents, config) {
        super(command, contents, config, {
            target: {},
            text: { trailing: true },
        });
    }
    get userInfo() {
        return new ChatUser(this._prefix.nick, this._tags);
    }
    get emoteOffsets() {
        return parseEmoteOffsets(this._tags.get('emotes'));
    }
}
Whisper.COMMAND = 'WHISPER';
export { Whisper };
