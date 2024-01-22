import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelUnbanEventData } from './EventSubChannelUnbanEvent.external';
/**
 * An EventSub event representing a user being unbanned in a channel.
 */
export declare class EventSubChannelUnbanEvent extends DataObject<EventSubChannelUnbanEventData> {
    /**
     * The ID of the unbanned user.
     */
    get userId(): string;
    /**
     * The name of the unbanned user.
     */
    get userName(): string;
    /**
     * The display name of the unbanned user.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the unbanned user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The ID of the broadcaster from whose chat the user was unbanned.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster from whose chat the user was unbanned.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster from whose chat the user was unbanned.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the moderator who issued the unban.
     */
    get moderatorId(): string;
    /**
     * The name of the moderator who issued the unban.
     */
    get moderatorName(): string;
    /**
     * The display name of the moderator who issued the unban.
     */
    get moderatorDisplayName(): string;
    /**
     * Gets more information about the moderator.
     */
    getModerator(): Promise<HelixUser>;
}
//# sourceMappingURL=EventSubChannelUnbanEvent.d.ts.map