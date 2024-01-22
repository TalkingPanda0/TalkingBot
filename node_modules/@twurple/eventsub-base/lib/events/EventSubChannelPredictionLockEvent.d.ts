import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelPredictionOutcome } from './common/EventSubChannelPredictionOutcome';
import { type EventSubChannelPredictionLockEventData } from './EventSubChannelPredictionLockEvent.external';
/**
 * An EventSub event representing a prediction being locked in a channel.
 */
export declare class EventSubChannelPredictionLockEvent extends DataObject<EventSubChannelPredictionLockEventData> {
    /**
     * The ID of the prediction.
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
     * The title of the prediction.
     */
    get title(): string;
    /**
     * The possible of the prediction.
     */
    get outcomes(): EventSubChannelPredictionOutcome[];
    /**
     * The time when the prediction started.
     */
    get startDate(): Date;
    /**
     * The time when the prediction was locked.
     */
    get lockDate(): Date;
}
//# sourceMappingURL=EventSubChannelPredictionLockEvent.d.ts.map