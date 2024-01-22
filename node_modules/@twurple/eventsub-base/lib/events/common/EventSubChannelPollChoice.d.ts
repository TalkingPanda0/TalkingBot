import { EventSubChannelPollBeginChoice } from './EventSubChannelPollBeginChoice';
/**
 * A choice in a poll.
 *
 * @inheritDoc
 */
export declare class EventSubChannelPollChoice extends EventSubChannelPollBeginChoice {
    /**
     * The number of votes for the choice added by using channel points.
     */
    get channelPointsVotes(): number;
    /**
     * The total number of votes for the choice, including bits and channel points.
     */
    get totalVotes(): number;
}
//# sourceMappingURL=EventSubChannelPollChoice.d.ts.map