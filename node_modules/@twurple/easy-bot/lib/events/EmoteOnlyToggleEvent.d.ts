import { type HelixUser } from '@twurple/api';
/**
 * An event representing emote-only mode being toggled in a channel.
 *
 * @meta category events
 */
export declare class EmoteOnlyToggleEvent {
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * Whether emote-only mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled(): boolean;
    /**
     * Enables emote-only mode in the channel.
     */
    enable(): Promise<void>;
    /**
     * Disables emote-only mode in the channel.
     */
    disable(): Promise<void>;
}
//# sourceMappingURL=EmoteOnlyToggleEvent.d.ts.map