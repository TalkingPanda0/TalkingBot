import { __decorate } from "tslib";
import { rawDataSymbol, rtfm } from '@twurple/common';
import { EventSubChannelPollBeginChoice } from "./EventSubChannelPollBeginChoice.mjs";
/**
 * A choice in a poll.
 *
 * @inheritDoc
 */
let EventSubChannelPollChoice = class EventSubChannelPollChoice extends EventSubChannelPollBeginChoice {
    /**
     * The number of votes for the choice added by using channel points.
     */
    get channelPointsVotes() {
        return this[rawDataSymbol].channel_points_votes;
    }
    /**
     * The total number of votes for the choice, including bits and channel points.
     */
    get totalVotes() {
        return this[rawDataSymbol].votes;
    }
};
EventSubChannelPollChoice = __decorate([
    rtfm('eventsub-base', 'EventSubChannelPollChoice', 'id')
], EventSubChannelPollChoice);
export { EventSubChannelPollChoice };
