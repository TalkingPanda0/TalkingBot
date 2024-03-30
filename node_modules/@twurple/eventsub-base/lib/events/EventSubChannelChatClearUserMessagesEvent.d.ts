import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelChatClearUserMessagesEventData } from './EventSubChannelChatClearUserMessagesEvent.external';
/**
 * An EventSub event representing a user's chat messages being cleared in a channel.
 */
export declare class EventSubChannelChatClearUserMessagesEvent extends DataObject<EventSubChannelChatClearUserMessagesEventData> {
    /**
     * The ID of the user whose chat messages were cleared.
     */
    get userId(): string;
    /**
     * The name of the user whose chat messages were cleared.
     */
    get userName(): string;
    /**
     * The display name of the user whose chat messages were cleared.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user whose chat messages were cleared.
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
}
//# sourceMappingURL=EventSubChannelChatClearUserMessagesEvent.d.ts.map