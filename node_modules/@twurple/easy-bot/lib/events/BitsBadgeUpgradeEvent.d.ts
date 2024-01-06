import { type HelixUser } from '@twurple/api';
import { type UserNotice } from '@twurple/chat';
/**
 * An event representing a user unlocking a new bits badge in a channel.
 *
 * @meta category events
 */
export declare class BitsBadgeUpgradeEvent {
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
     * The ID of the user who unlocked the badge.
     */
    get userId(): string;
    /**
     * The name of the user who unlocked the badge.
     */
    get userName(): string;
    /**
     * The display name of the user who unlocked the badge.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user who unlocked the badge.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The bits threshold that was reached.
     */
    get threshold(): number;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
}
//# sourceMappingURL=BitsBadgeUpgradeEvent.d.ts.map