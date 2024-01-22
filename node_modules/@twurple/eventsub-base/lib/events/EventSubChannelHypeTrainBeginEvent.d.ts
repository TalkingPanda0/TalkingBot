import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelHypeTrainContribution } from './common/EventSubChannelHypeTrainContribution';
import { type EventSubChannelHypeTrainBeginEventData } from './EventSubChannelHypeTrainBeginEvent.external';
/**
 * An EventSub event representing a Hype Train starting in a channel.
 */
export declare class EventSubChannelHypeTrainBeginEvent extends DataObject<EventSubChannelHypeTrainBeginEventData> {
    /**
     * The ID of the Hype Train.
     */
    get id(): string;
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
     * The level the Hype Train started on.
     */
    get level(): number;
    /**
     * The total points already contributed to the Hype Train.
     */
    get total(): number;
    /**
     * The number of points contributed to the Hype Train at the current level.
     */
    get progress(): number;
    /**
     * The number of points required to reach the next level.
     */
    get goal(): number;
    /**
     * The contributors with the most points, for both bits and subscriptions.
     */
    get topContributors(): EventSubChannelHypeTrainContribution[];
    /**
     * The most recent contribution.
     */
    get lastContribution(): EventSubChannelHypeTrainContribution;
    /**
     * The time when the Hype Train started.
     */
    get startDate(): Date;
    /**
     * The time when the Hype Train is expected to expire, unless a change of level occurs to extend the expiration.
     */
    get expiryDate(): Date;
}
//# sourceMappingURL=EventSubChannelHypeTrainBeginEvent.d.ts.map