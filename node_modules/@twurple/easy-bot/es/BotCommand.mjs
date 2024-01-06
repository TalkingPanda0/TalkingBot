/**
 * A base class to implement bot commands with advanced command matching.
 *
 * For basic commands, it is recommended to use the {@link createBotCommand} helper instead.
 *
 * @meta category main
 */
export class BotCommand {
    /**
     * Additional names for the command.
     */
    get aliases() {
        return [];
    }
    /**
     * Checks whether a message matches this command,
     * and if it does, returns the parameters to pass to the execution handler.
     *
     * @param line The text of the message.
     * @param prefix The command prefix set in the bot configuration.
     */
    match(line, prefix) {
        let [command, ...params] = line.split(' ');
        if (!command.startsWith(prefix)) {
            return null;
        }
        command = command.slice(prefix.length);
        if (command === this.name || this.aliases.includes(command)) {
            return params;
        }
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    canExecute(channelId, userId) {
        return true;
    }
}
