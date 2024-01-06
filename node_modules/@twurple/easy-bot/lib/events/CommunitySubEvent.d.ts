import { type HelixUser } from '@twurple/api';
import { type UserNotice } from '@twurple/chat';
/**
 * An event representing a user gifting subscriptions to the community of a channel.
 *
 * @meta category events
 */
export declare class CommunitySubEvent {
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
     * The ID of the user who sent the gift.
     */
    get gifterId(): string | null;
    /**
     * The name of the user who sent the gift.
     */
    get gifterName(): string | null;
    /**
     * The display name of the user who sent the gift.
     */
    get gifterDisplayName(): string | null;
    /**
     * Gets more information about the user who sent the gift.
     */
    getGifter(): Promise<HelixUser | null>;
    /**
     * The plan of the gifted subscription.
     */
    get plan(): string;
    /**
     * The number of subscriptions that were gifted.
     */
    get count(): number;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
}
//# sourceMappingURL=CommunitySubEvent.d.ts.map