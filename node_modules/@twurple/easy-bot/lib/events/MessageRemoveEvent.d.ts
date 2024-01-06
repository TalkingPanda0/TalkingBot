import { type HelixUser } from '@twurple/api';
import { type ClearMsg } from '@twurple/chat';
/**
 * An event representing a message being removed from a channel's chat.
 *
 * @meta category events
 */
export declare class MessageRemoveEvent {
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
     * The name of the user who originally sent the message.
     */
    get userName(): string;
    /**
     * The ID of the deleted message.
     */
    get messageId(): string;
    /**
     * The text of the deleted message.
     */
    get originalText(): string;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): ClearMsg;
}
//# sourceMappingURL=MessageRemoveEvent.d.ts.map