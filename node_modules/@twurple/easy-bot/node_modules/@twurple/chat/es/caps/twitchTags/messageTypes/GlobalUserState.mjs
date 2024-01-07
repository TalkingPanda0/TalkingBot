import { Message } from 'ircv3';
/**
 * This command has no parameters, all information is in tags.
 *
 * @private
 */
class GlobalUserState extends Message {
}
GlobalUserState.COMMAND = 'GLOBALUSERSTATE';
export { GlobalUserState };
