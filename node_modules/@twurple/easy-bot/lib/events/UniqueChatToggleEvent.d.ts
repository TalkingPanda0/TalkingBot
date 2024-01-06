import { type HelixUser } from '@twurple/api';
/**
 * An event representing unique chat mode being toggled in a channel.
 *
 * @meta category events
 */
export declare class UniqueChatToggleEvent {
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * Whether unique chat mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled(): boolean;
    /**
     * Enables unique chat mode in the channel.
     */
    enable(): Promise<void>;
    /**
     * Disables unique chat mode in the channel.
     */
    disable(): Promise<void>;
}
//# sourceMappingURL=UniqueChatToggleEvent.d.ts.map