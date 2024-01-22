import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelFollowEventData } from './EventSubChannelFollowEvent.external';
/**
 * An EventSub event representing a channel being followed.
 */
export declare class EventSubChannelFollowEvent extends DataObject<EventSubChannelFollowEventData> {
    /**
     * The ID of the following user.
     */
    get userId(): string;
    /**
     * The name of the following user.
     */
    get userName(): string;
    /**
     * The display name of the following user.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the following user.
     */
    getUser(): Promise<HelixUser>;
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
     * The date when the user followed.
     */
    get followDate(): Date;
}
//# sourceMappingURL=EventSubChannelFollowEvent.d.ts.map