import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelSubscriptionEndEventData, type EventSubChannelSubscriptionEndEventTier } from './EventSubChannelSubscriptionEndEvent.external';
/**
 * An EventSub event representing the end of a channel subscription.
 */
export declare class EventSubChannelSubscriptionEndEvent extends DataObject<EventSubChannelSubscriptionEndEventData> {
    /**
     * The ID of the user whose subscription is ending.
     */
    get userId(): string;
    /**
     * The name of the user whose subscription is ending.
     */
    get userName(): string;
    /**
     * The display name of the user whose subscription is ending.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user whose subscription is ending.
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
    get tier(): EventSubChannelSubscriptionEndEventTier;
    /**
     * Whether the subscription has been gifted.
     */
    get isGift(): boolean;
}
//# sourceMappingURL=EventSubChannelSubscriptionEndEvent.d.ts.map