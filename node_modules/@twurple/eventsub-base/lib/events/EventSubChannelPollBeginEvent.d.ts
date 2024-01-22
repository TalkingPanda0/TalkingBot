import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelPollBeginChoice } from './common/EventSubChannelPollBeginChoice';
import { type EventSubChannelPollBeginEventData } from './EventSubChannelPollBeginEvent.external';
/**
 * An EventSub event representing a poll starting in a channel.
 */
export declare class EventSubChannelPollBeginEvent extends DataObject<EventSubChannelPollBeginEventData> {
    /**
     * The ID of the poll.
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
     * The title of the poll.
     */
    get title(): string;
    /**
     * The choices of the poll.
     */
    get choices(): EventSubChannelPollBeginChoice[];
    /**
     * Whether voting with bits is enabled.
     */
    get isBitsVotingEnabled(): boolean;
    /**
     * The amount of bits a vote costs.
     */
    get bitsPerVote(): number;
    /**
     * Whether voting with channel points is enabled.
     */
    get isChannelPointsVotingEnabled(): boolean;
    /**
     * The amount of channel points a vote costs.
     */
    get channelPointsPerVote(): number;
    /**
     * The time when the poll started.
     */
    get startDate(): Date;
    /**
     * The time when the poll ends.
     */
    get endDate(): Date;
}
//# sourceMappingURL=EventSubChannelPollBeginEvent.d.ts.map