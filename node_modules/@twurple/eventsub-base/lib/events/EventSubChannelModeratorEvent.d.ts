import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelModeratorEventData } from './EventSubChannelModeratorEvent.external';
/**
 * An EventSub event representing a broadcaster adding or removing a moderator in their channel.
 */
export declare class EventSubChannelModeratorEvent extends DataObject<EventSubChannelModeratorEventData> {
    /**
     * The ID of the broadcaster that added or removed a moderator.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster that added or removed a moderator.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster that added or removed a moderator.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the user that was added or removed as a moderator.
     */
    get userId(): string;
    /**
     * The name of the user that was added or removed as a moderator.
     */
    get userName(): string;
    /**
     * The display name of the user that was added or removed as a moderator.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user.
     */
    getUser(): Promise<HelixUser>;
}
//# sourceMappingURL=EventSubChannelModeratorEvent.d.ts.map