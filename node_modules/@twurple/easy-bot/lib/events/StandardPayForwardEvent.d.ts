import { type HelixUser } from '@twurple/api';
import { type UserNotice } from '@twurple/chat';
/**
 * An event representing a user gifting a subscription to a specific user in a channel
 * in response to getting one gifted.
 *
 * @meta category events
 */
export declare class StandardPayForwardEvent {
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
     * The ID of the recipient of the gift.
     */
    get userId(): string;
    /**
     * The display name of the recipient of the gift.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the recipient of the gift.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The ID of the user who sent the new gift.
     */
    get gifterId(): string;
    /**
     * The name of the user who sent the new gift.
     */
    get gifterName(): string;
    /**
     * The display name of the user who sent the new gift.
     */
    get gifterDisplayName(): string;
    /**
     * Gets more information about the user who sent the new gift.
     */
    getGifter(): Promise<HelixUser>;
    /**
     * The ID of the user who sent the original gift, or `null` if they were anonymous.
     */
    get originalGifterId(): string | null;
    /**
     * The display name of the user who sent the original gift, or `null` if they were anonymous.
     */
    get originalGifterDisplayName(): string | null;
    /**
     * Gets more information about the user who sent the original gift, or `null` if they were anonymous.
     */
    getOriginalGifter(): Promise<HelixUser | null>;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
}
//# sourceMappingURL=StandardPayForwardEvent.d.ts.map