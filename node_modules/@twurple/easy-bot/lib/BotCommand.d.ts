import { type BotCommandContext } from './BotCommandContext';
/** @private */
export interface BotCommandMatch {
    command: BotCommand;
    params: string[];
}
/**
 * A base class to implement bot commands with advanced command matching.
 *
 * For basic commands, it is recommended to use the {@link createBotCommand} helper instead.
 *
 * @meta category main
 */
export declare abstract class BotCommand {
    /**
     * The main name of the command.
     */
    abstract get name(): string;
    /**
     * Additional names for the command.
     */
    get aliases(): string[];
    /**
     * Checks whether a message matches this command,
     * and if it does, returns the parameters to pass to the execution handler.
     *
     * @param line The text of the message.
     * @param prefix The command prefix set in the bot configuration.
     */
    match(line: string, prefix: string): string[] | null;
    canExecute(channelId: string, userId: string): boolean;
    /**
     * Handles the command execution.
     *
     * @param params The parameters returned by the matcher.
     * @param context The command context.
     */
    abstract execute(params: string[], context: BotCommandContext): void | Promise<void>;
}
//# sourceMappingURL=BotCommand.d.ts.map