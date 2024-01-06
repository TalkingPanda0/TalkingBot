import { type HelixUser } from '@twurple/api';
/**
 * An event representing followers-only mode being toggled in a channel.
 *
 * @meta category events
 */
export declare class FollowersOnlyToggleEvent {
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * Whether followers-only mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled(): boolean;
    /**
     * The time (in minutes) a user needs to follow the channel in order to be able to send messages in its chat.
     *
     * There needs to be a distinction between the values `0` (a user can chat immediately after following)
     * and `null` (followers-only mode was disabled).
     */
    get delay(): number | null;
    /**
     * Enables followers-only mode in the channel.
     *
     * @param delay The time (in minutes) a user needs to follow the channel in order to be able to send messages.
     */
    enable(delay?: number): Promise<void>;
    /**
     * Disables followers-only mode in the channel.
     */
    disable(): Promise<void>;
}
//# sourceMappingURL=FollowersOnlyToggleEvent.d.ts.map