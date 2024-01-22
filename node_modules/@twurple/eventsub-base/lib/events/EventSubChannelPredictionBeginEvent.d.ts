import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelPredictionBeginOutcome } from './common/EventSubChannelPredictionBeginOutcome';
import { type EventSubChannelPredictionBeginEventData } from './EventSubChannelPredictionBeginEvent.external';
/**
 * An EventSub event representing a prediction starting in a channel.
 */
export declare class EventSubChannelPredictionBeginEvent extends DataObject<EventSubChannelPredictionBeginEventData> {
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
     * The possible outcomes of the prediction.
     */
    get outcomes(): EventSubChannelPredictionBeginOutcome[];
    /**
     * The time when the prediction started.
     */
    get startDate(): Date;
    /**
     * The time when the prediction is locked.
     */
    get lockDate(): Date;
}
//# sourceMappingURL=EventSubChannelPredictionBeginEvent.d.ts.map