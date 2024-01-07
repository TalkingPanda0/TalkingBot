import { Message } from 'ircv3';
/** @private */
class UserState extends Message {
    constructor(command, contents, config) {
        super(command, contents, config, {
            channel: { type: 'channel' },
        });
    }
}
UserState.COMMAND = 'USERSTATE';
export { UserState };
