import { type HelixUser } from '@twurple/api';
import { type UserNotice } from '@twurple/chat';
/**
 * An event representing an incoming raid.
 *
 * @meta category events
 */
export declare class RaidEvent {
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
     * The ID of the raid leader.
     */
    get userId(): string;
    /**
     * The name of the raid leader.
     */
    get userName(): string;
    /**
     * The display name of the raid leader.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the raid leader.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The number of viewers joining with the raid.
     */
    get viewerCount(): number;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
}
//# sourceMappingURL=RaidEvent.d.ts.map