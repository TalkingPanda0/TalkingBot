import { type HelixUser } from '@twurple/api';
import { type ClearChat } from '@twurple/chat';
/**
 * An event representing the chat of a channel getting cleared.
 *
 * @meta category events
 */
export declare class ChatClearEvent {
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
     * The full object that contains all the message information.
     */
    get messageObject(): ClearChat;
}
//# sourceMappingURL=ChatClearEvent.d.ts.map