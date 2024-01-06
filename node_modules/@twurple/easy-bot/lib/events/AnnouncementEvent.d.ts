import { type HelixUser } from '@twurple/api';
/**
 * An event representing an announcement in chat.
 *
 * @meta category events
 */
export declare class AnnouncementEvent {
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the user who sent the announcement.
     */
    get userId(): string;
    /**
     * The name of the user who sent the announcement.
     */
    get userName(): string;
    /**
     * The display name of the user who sent the announcement.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The color of the announcement.
     */
    get color(): string;
}
//# sourceMappingURL=AnnouncementEvent.d.ts.map