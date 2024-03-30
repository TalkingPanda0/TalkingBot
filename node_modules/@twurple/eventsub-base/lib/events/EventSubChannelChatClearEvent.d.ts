import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelChatClearEventData } from './EventSubChannelChatClearEvent.external';
/**
 * An EventSub event representing a channel's chat being cleared.
 */
export declare class EventSubChannelChatClearEvent extends DataObject<EventSubChannelChatClearEventData> {
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
//# sourceMappingURL=EventSubChannelChatClearEvent.d.ts.map