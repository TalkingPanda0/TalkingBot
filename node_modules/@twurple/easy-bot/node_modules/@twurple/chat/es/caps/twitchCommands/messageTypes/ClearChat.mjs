import { Message } from 'ircv3';
class ClearChat extends Message {
    constructor(command, contents, config) {
        super(command, contents, config, {
            channel: { type: 'channel' },
            user: { trailing: true, optional: true },
        });
    }
    get date() {
        const timestamp = this._tags.get('tmi-sent-ts');
        return new Date(Number(timestamp));
    }
    get channelId() {
        return this._tags.get('room-id');
    }
    get targetUserId() {
        var _a;
        return (_a = this._tags.get('target-user-id')) !== null && _a !== void 0 ? _a : null;
    }
}
ClearChat.COMMAND = 'CLEARCHAT';
export { ClearChat };
