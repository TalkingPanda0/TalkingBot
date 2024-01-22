import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelPollChoice } from './common/EventSubChannelPollChoice';
import { type EventSubChannelPollEndEventData, type EventSubChannelPollEndStatus } from './EventSubChannelPollEndEvent.external';
/**
 * An EventSub event representing a poll starting in a channel.
 */
export declare class EventSubChannelPollEndEvent extends DataObject<EventSubChannelPollEndEventData> {
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
    get choices(): EventSubChannelPollChoice[];
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
     * The status of the poll.
     */
    get status(): EventSubChannelPollEndStatus;
    /**
     * The time when the poll started.
     */
    get startDate(): Date;
    /**
     * The time when the poll ends.
     */
    get endDate(): Date;
}
//# sourceMappingURL=EventSubChannelPollEndEvent.d.ts.map