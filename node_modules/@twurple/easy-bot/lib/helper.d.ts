import { BotCommand } from './BotCommand';
import { type BotCommandContext } from './BotCommandContext';
/**
 * Options for a bot command.
 */
export interface CreateBotCommandOptions {
    /**
     * The cooldown of the command for everyone, in seconds.
     */
    globalCooldown?: number;
    /**
     * The cooldown of the command per user, in seconds.
     */
    userCooldown?: number;
    /**
     * The interval in which expired cooldown data should be cleared, in seconds. Defaults to 10 minutes.
     */
    cooldownCleanupRate?: number;
}
/**
 * Creates a simple bot command.
 *
 * @meta category main
 *
 * @expandParams
 *
 * @param commandName The name of the command.
 * @param handler The execution handler that should be called when the command is sent.
 * @param options
 */
export declare function createBotCommand(commandName: string, handler: (params: string[], context: BotCommandContext) => void | Promise<void>, options?: CreateBotCommandOptions): BotCommand;
//# sourceMappingURL=helper.d.ts.map