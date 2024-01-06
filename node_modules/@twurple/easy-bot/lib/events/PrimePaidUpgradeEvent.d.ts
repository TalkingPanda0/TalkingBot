import { type HelixUser } from '@twurple/api';
import { type ChatSubUpgradeInfo, type UserNotice } from '@twurple/chat';
import { type Bot } from '../Bot';
/**
 * An event representing a free subscription from Prime Gaming being replaced by a paid one.
 *
 * @meta category events
 */
export declare class PrimePaidUpgradeEvent {
    constructor(channel: string, userName: string, info: ChatSubUpgradeInfo, msg: UserNotice, bot: Bot);
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
     * The ID of the user who paid for their subscription.
     */
    get userId(): string;
    /**
     * The name of the user who paid for their subscription.
     */
    get userName(): string;
    /**
     * The display name of the user who paid for their subscription.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user who paid for their subscription.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The plan of the subscription.
     */
    get plan(): string;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
}
//# sourceMappingURL=PrimePaidUpgradeEvent.d.ts.map