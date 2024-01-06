import { type HelixUser } from '@twurple/api';
/**
 * An event representing the bot failing to join a channel.
 *
 * @meta category events
 */
export declare class JoinFailureEvent {
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The reason why the join failed.
     */
    get reason(): string;
    /**
     * Tries to join again.
     */
    retry(): Promise<void>;
}
//# sourceMappingURL=JoinFailureEvent.d.ts.map