import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelHypeTrainContribution } from './common/EventSubChannelHypeTrainContribution';
import { type EventSubChannelHypeTrainEndEventData } from './EventSubChannelHypeTrainEndEvent.external';
/**
 * An EventSub event representing the end of a Hype train event.
 */
export declare class EventSubChannelHypeTrainEndEvent extends DataObject<EventSubChannelHypeTrainEndEventData> {
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
     * The level the Hype Train ended on.
     */
    get level(): number;
    /**
     * The total points contributed to the Hype Train.
     */
    get total(): number;
    /**
     * The contributors with the most points, for both bits and subscriptions.
     */
    get topContributors(): EventSubChannelHypeTrainContribution[];
    /**
     * The time when the Hype Train started.
     */
    get startDate(): Date;
    /**
     * The time when the Hype Train ended.
     */
    get endDate(): Date;
    /**
     * The time when the Hype Train cooldown ends.
     */
    get cooldownEndDate(): Date;
}
//# sourceMappingURL=EventSubChannelHypeTrainEndEvent.d.ts.map