import { type HelixUser } from '@twurple/api';
import { type UserNotice } from '@twurple/chat';
/**
 * An event representing a gifted subscription being replaced by a paid one.
 *
 * @meta category events
 */
export declare class GiftPaidUpgradeEvent {
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
     * The ID of the user who paid for their subscription.
     */
    get userId(): string;
    /**
     * The name of the user who paid for their subscription.
     */
    get userName(): string;
    /**
     * The display name of the user who paid for their subscription.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user who paid for their subscription.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The name of the user who sent the original gift.
     */
    get gifterName(): string;
    /**
     * The display name of the user who sent the original gift.
     */
    get gifterDisplayName(): string;
    /**
     * Gets more information about the user who sent the original gift.
     */
    getGifter(): Promise<HelixUser>;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
}
//# sourceMappingURL=GiftPaidUpgradeEvent.d.ts.map