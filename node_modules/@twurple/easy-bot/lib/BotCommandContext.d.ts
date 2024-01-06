import { type ChatMessage } from '@twurple/chat';
import { type CommercialLength } from '@twurple/common';
import { type ChatAnnouncementColor } from './Bot';
/**
 * The message context of a bot command execution handler.
 *
 * @meta category main
 */
export declare class BotCommandContext {
    private readonly _bot;
    readonly msg: ChatMessage;
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * The ID of the user who sent the message.
     */
    get userId(): string;
    /**
     * The name of the user who sent the message.
     */
    get userName(): string;
    /**
     * The display name of the user who sent the message.
     */
    get userDisplayName(): string;
    /**
     * Sends an action (/me) to the channel.
     *
     * @param text The text to send.
     */
    action: (text: string) => Promise<void>;
    /**
     * Sends an announcement to the channel.
     *
     * @param text The text to send.
     * @param color The color to send the announcement in. If not passed, uses the default channel color.
     */
    announce: (text: string, color?: ChatAnnouncementColor) => Promise<void>;
    /**
     * Bans the user who sent the message from the channel.
     *
     * @param reason The reason for the ban.
     */
    ban: (reason: string) => Promise<void>;
    /**
     * Removes all messages from the channel.
     */
    clear: () => Promise<void>;
    /**
     * Runs a commercial break on the channel.
     *
     * @param length The duration of the commercial break.
     */
    runCommercial: (length?: CommercialLength) => Promise<void>;
    /**
     * Deletes the message from the channel.
     */
    delete: () => Promise<void>;
    /**
     * Enables emote-only mode in the channel.
     */
    enableEmoteOnly: () => Promise<void>;
    /**
     * Disables emote-only mode in the channel.
     */
    disableEmoteOnly: () => Promise<void>;
    /**
     * Enables followers-only mode in the channel.
     *
     * @param minFollowTime The time (in minutes) a user needs to be following before being able to send messages.
     */
    enableFollowersOnly: (minFollowTime?: number) => Promise<void>;
    /**
     * Disables followers-only mode in the channel.
     */
    disableFollowersOnly: () => Promise<void>;
    /**
     * Enables unique chat mode in the channel.
     */
    enableUniqueChat: () => Promise<void>;
    /**
     * Disables unique chat mode in the channel.
     */
    disableUniqueChat: () => Promise<void>;
    /**
     * Enables slow mode in the channel.
     *
     * @param delayBetweenMessages The time (in seconds) a user needs to wait between messages.
     */
    enableSlow: (delayBetweenMessages?: number) => Promise<void>;
    /**
     * Disables slow mode in the channel.
     */
    disableSlow: () => Promise<void>;
    /**
     * Enables subscribers-only mode in the channel.
     */
    enableSubsOnly: () => Promise<void>;
    /**
     * Disables subscribers-only mode in the channel.
     */
    disableSubsOnly: () => Promise<void>;
    /**
     * Gives the user VIP status in the channel.
     */
    addVip: () => Promise<void>;
    /**
     * Takes VIP status from the user in the channel.
     */
    removeVip: () => Promise<void>;
    /**
     * Times out then user in the channel and removes all their messages.
     *
     * @param duration The time (in seconds) until the user can send messages again. Defaults to 1 minute.
     * @param reason The reason for the timeout.
     */
    timeout: (duration?: number, reason?: string) => Promise<void>;
    /**
     * Removes all messages of the user from the channel.
     *
     * @param reason The reason for the purge.
     */
    purge: (reason?: string) => Promise<void>;
    /**
     * Sends a reply to the chat message to the channel.
     *
     * @param text The text to send.
     */
    reply: (text: string) => Promise<void>;
    /**
     * Sends a regular chat message to the channel.
     *
     * @param text The text to send.
     */
    say: (text: string) => Promise<void>;
}
//# sourceMappingURL=BotCommandContext.d.ts.map