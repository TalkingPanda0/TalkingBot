import { type HelixUser } from '@twurple/api';
import { type ClearChat } from '@twurple/chat';
/**
 * An event representing a user getting banned from a channel.
 *
 * @meta category events
 */
export declare class BanEvent {
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the user who was banned.
     */
    get userId(): string;
    /**
     * The name of the user who was banned.
     */
    get userName(): string;
    /**
     * Gets more information about the user who was banned.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The duration of the ban, or `null` if it's permanent.
     */
    get duration(): number | null;
    /**
     * Remove the ban.
     */
    unban(): Promise<void>;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): ClearChat;
}
//# sourceMappingURL=BanEvent.d.ts.map