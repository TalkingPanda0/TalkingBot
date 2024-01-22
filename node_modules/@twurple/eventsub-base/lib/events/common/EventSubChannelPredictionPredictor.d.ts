import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelPredictionPredictorData } from './EventSubChannelPredictionPredictor.external';
/**
 * A user that voted on a prediction.
 */
export declare class EventSubChannelPredictionPredictor extends DataObject<EventSubChannelPredictionPredictorData> {
    /**
     * The ID of the predictor.
     */
    get userId(): string;
    /**
     * The name of the predictor.
     */
    get userName(): string;
    /**
     * The display name of the predictor.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the predictor.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The number of channel points the predictor used.
     */
    get channelPointsUsed(): number;
    /**
     * The number of channel points the predictor won, or null if they didn't win (yet).
     */
    get channelPointsWon(): number | null;
}
//# sourceMappingURL=EventSubChannelPredictionPredictor.d.ts.map