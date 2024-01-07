import { Message } from 'ircv3';
class RoomState extends Message {
    constructor(command, contents, config) {
        super(command, contents, config, {
            channel: { type: 'channel' },
        });
    }
}
RoomState.COMMAND = 'ROOMSTATE';
export { RoomState };
