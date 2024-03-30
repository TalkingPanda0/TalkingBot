import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelChatMessageDeleteEventData } from './EventSubChannelChatMessageDeleteEvent.external';
/**
 * An EventSub event representing a chat message being deleted in a channel.
 */
export declare class EventSubChannelChatMessageDeleteEvent extends DataObject<EventSubChannelChatMessageDeleteEventData> {
    /**
     * The ID of the user whose chat message was deleted.
     */
    get userId(): string;
    /**
     * The name of the user whose chat message was deleted.
     */
    get userName(): string;
    /**
     * The display name of the user whose chat message was deleted.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user whose chat message was deleted.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the message that was deleted.
     */
    get messageId(): string;
}
//# sourceMappingURL=EventSubChannelChatMessageDeleteEvent.d.ts.map