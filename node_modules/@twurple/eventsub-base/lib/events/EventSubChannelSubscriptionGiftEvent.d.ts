import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelSubscriptionGiftEventData, type EventSubChannelSubscriptionGiftEventTier } from './EventSubChannelSubscriptionGiftEvent.external';
/**
 * An EventSub event representing a channel subscription.
 */
export declare class EventSubChannelSubscriptionGiftEvent extends DataObject<EventSubChannelSubscriptionGiftEventData> {
    /**
     * The ID of the gifting user.
     */
    get gifterId(): string;
    /**
     * The name of the gifting user.
     */
    get gifterName(): string;
    /**
     * The display name of the gifting user.
     */
    get gifterDisplayName(): string;
    /**
     * Gets more information about the gifting user.
     */
    getGifter(): Promise<HelixUser>;
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The amount of gifts that were gifted.
     */
    get amount(): number;
    /**
     * The amount of gifts that the gifter has sent in total, or `null` the gift is anonymous.
     */
    get cumulativeAmount(): number | null;
    /**
     * The tier of the subscription, either 1000, 2000 or 3000.
     */
    get tier(): EventSubChannelSubscriptionGiftEventTier;
    /**
     * Whether the gift is anonymous.
     */
    get isAnonymous(): boolean;
}
//# sourceMappingURL=EventSubChannelSubscriptionGiftEvent.d.ts.map