import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelSubscriptionMessageEventData, type EventSubChannelSubscriptionMessageEventTier } from './EventSubChannelSubscriptionMessageEvent.external';
/**
 * An EventSub event representing the public announcement of a channel subscription by the subscriber.
 */
export declare class EventSubChannelSubscriptionMessageEvent extends DataObject<EventSubChannelSubscriptionMessageEventData> {
    /**
     * The ID of the user whose subscription is being announced.
     */
    get userId(): string;
    /**
     * The name of the user whose subscription is being announced.
     */
    get userName(): string;
    /**
     * The display name of the user whose subscription is being announced.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user whose subscription is being announced.
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
    get tier(): EventSubChannelSubscriptionMessageEventTier;
    /**
     * The total number of months the user has been subscribed.
     */
    get cumulativeMonths(): number;
    /**
     * The number of months the user has been subscribed in a row, or null if they don't want to share it.
     */
    get streakMonths(): number | null;
    /**
     * The number of months the user has now subscribed.
     */
    get durationMonths(): number;
    /**
     * The text of the message.
     */
    get messageText(): string;
    /**
     * The offsets of emote usages in the message.
     */
    get emoteOffsets(): Map<string, string[]>;
}
//# sourceMappingURL=EventSubChannelSubscriptionMessageEvent.d.ts.map