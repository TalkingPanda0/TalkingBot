import { DataObject } from '@twurple/common';
import { type EventSubChannelPredictionBeginOutcomeData, type EventSubChannelPredictionColor } from './EventSubChannelPredictionBeginOutcome.external';
/**
 * A possible outcome of a prediction, as defined when beginning that prediction.
 */
export declare class EventSubChannelPredictionBeginOutcome extends DataObject<EventSubChannelPredictionBeginOutcomeData> {
    /**
     * The ID of the outcome.
     */
    get id(): string;
    /**
     * The title of the outcome.
     */
    get title(): string;
    /**
     * The color of the outcome.
     */
    get color(): EventSubChannelPredictionColor;
}
//# sourceMappingURL=EventSubChannelPredictionBeginOutcome.d.ts.map