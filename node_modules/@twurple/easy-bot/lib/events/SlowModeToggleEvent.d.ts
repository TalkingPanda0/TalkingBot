import { type HelixUser } from '@twurple/api';
/**
 * An event representing slow mode being toggled in a channel.
 *
 * @meta category events
 */
export declare class SlowModeToggleEvent {
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * Whether slow mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled(): boolean;
    /**
     * The time (in seconds) a user has to wait after sending a message to send another one.
     */
    get delay(): number | null;
    /**
     * Enables slow mode in the channel.
     *
     * @param delay The time (in seconds) a user has to wait after sending a message to send another one.
     */
    enable(delay?: number): Promise<void>;
    /**
     * Disables slow mode in the channel.
     */
    disable(): Promise<void>;
}
//# sourceMappingURL=SlowModeToggleEvent.d.ts.map