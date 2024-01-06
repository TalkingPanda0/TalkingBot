import { type HelixUser } from '@twurple/api';
import { type UserNotice } from '@twurple/chat';
/**
 * An event representing an outgoing raid being canceled.
 *
 * @meta category events
 */
export declare class RaidCancelEvent {
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
     * The ID of the user who canceled the raid.
     */
    get userId(): string;
    /**
     * The name of the user who canceled the raid.
     */
    get userName(): string;
    /**
     * The display name of the user who canceled the raid.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user who canceled the raid.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
}
//# sourceMappingURL=RaidCancelEvent.d.ts.map