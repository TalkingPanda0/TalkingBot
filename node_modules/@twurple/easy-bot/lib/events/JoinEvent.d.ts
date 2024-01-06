import { type HelixUser } from '@twurple/api';
/**
 * An event representing a user joining a channel.
 *
 * The join/leave events are cached by the Twitch chat server and will be batched and sent every 30-60 seconds.
 *
 * Please note that if you have not enabled the `requestMembershipEvents` option
 * or the channel has more than 1000 connected chatters, this will only react to your own joins.
 *
 * @meta category events
 */
export declare class JoinEvent {
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The name of the user.
     */
    get userName(): string;
    /**
     * Gets more information about the user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * Leaves the channel.
     */
    leave(): void;
}
//# sourceMappingURL=JoinEvent.d.ts.map