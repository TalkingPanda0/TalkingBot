"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserState = void 0;
const ircv3_1 = require("ircv3");
/** @private */
class UserState extends ircv3_1.Message {
    constructor(command, contents, config) {
        super(command, contents, config, {
            channel: { type: 'channel' },
        });
    }
}
UserState.COMMAND = 'USERSTATE';
exports.UserState = UserState;
