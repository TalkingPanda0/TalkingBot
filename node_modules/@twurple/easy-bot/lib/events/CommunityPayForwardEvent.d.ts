import { type HelixUser } from '@twurple/api';
/**
 * An event representing a user gifting a subscription to the community of a channel in response to getting one gifted.
 *
 * @meta category events
 */
export declare class CommunityPayForwardEvent {
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
}
//# sourceMappingURL=CommunityPayForwardEvent.d.ts.map