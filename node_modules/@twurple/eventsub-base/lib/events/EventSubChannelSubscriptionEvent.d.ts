import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelSubscriptionEventData, type EventSubChannelSubscriptionEventTier } from './EventSubChannelSubscriptionEvent.external';
/**
 * An EventSub event representing a channel subscription.
 */
export declare class EventSubChannelSubscriptionEvent extends DataObject<EventSubChannelSubscriptionEventData> {
    /**
     * The ID of the subscribing user.
     */
    get userId(): string;
    /**
     * The name of the subscribing user.
     */
    get userName(): string;
    /**
     * The display name of the subscribing user.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the subscribing user.
     */
    getUser(): Promise<HelixUser>;
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
     * The tier of the subscription, either 1000, 2000 or 3000.
     */
    get tier(): EventSubChannelSubscriptionEventTier;
    /**
     * Whether the subscription has been gifted.
     */
    get isGift(): boolean;
}
//# sourceMappingURL=EventSubChannelSubscriptionEvent.d.ts.map