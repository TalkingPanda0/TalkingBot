import { EventSubChannelPredictionBeginOutcome } from './EventSubChannelPredictionBeginOutcome';
import { EventSubChannelPredictionPredictor } from './EventSubChannelPredictionPredictor';
/**
 * A possible outcome of a prediction.
 */
export declare class EventSubChannelPredictionOutcome extends EventSubChannelPredictionBeginOutcome {
    /**
     * The number of users that predicted the outcome.
     */
    get users(): number;
    /**
     * The number of channel points that were bet on the outcome.
     */
    get channelPoints(): number;
    /**
     * The top predictors of the choice.
     */
    get topPredictors(): EventSubChannelPredictionPredictor[];
}
//# sourceMappingURL=EventSubChannelPredictionOutcome.d.ts.map