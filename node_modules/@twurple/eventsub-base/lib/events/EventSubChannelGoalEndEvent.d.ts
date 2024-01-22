import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import type { EventSubChannelGoalType } from './common/EventSubChannelGoalType';
import { type EventSubChannelGoalEndEventData } from './EventSubChannelGoalEndEvent.external';
/**
 * An EventSub event representing a creator goal starting in a channel.
 */
export declare class EventSubChannelGoalEndEvent extends DataObject<EventSubChannelGoalEndEventData> {
    /**
     * The ID of the goal.
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
     * The type of the goal. Can be either "follower" or "subscription".
     */
    get type(): EventSubChannelGoalType;
    /**
     * The description of the goal.
     */
    get description(): string;
    /**
     * Whether the goal has been achieved or not.
     */
    get isAchieved(): boolean;
    /**
     * The current value of the goal.
     */
    get currentAmount(): number;
    /**
     * The target value of the goal.
     */
    get targetAmount(): number;
    /**
     * The time when the goal started.
     */
    get startDate(): Date;
    /**
     * The time when the goal ended.
     */
    get endDate(): Date;
}
//# sourceMappingURL=EventSubChannelGoalEndEvent.d.ts.map