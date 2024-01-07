"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalUserState = void 0;
const ircv3_1 = require("ircv3");
/**
 * This command has no parameters, all information is in tags.
 *
 * @private
 */
class GlobalUserState extends ircv3_1.Message {
}
GlobalUserState.COMMAND = 'GLOBALUSERSTATE';
exports.GlobalUserState = GlobalUserState;
