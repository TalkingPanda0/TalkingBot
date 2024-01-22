import type { HelixGame, HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelUpdateEventData } from './EventSubChannelUpdateEvent.external';
/**
 * An EventSub event representing a change in channel metadata.
 */
export declare class EventSubChannelUpdateEvent extends DataObject<EventSubChannelUpdateEventData> {
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
     * The title of the stream.
     */
    get streamTitle(): string;
    /**
     * The language of the stream.
     */
    get streamLanguage(): string;
    /**
     * The ID of the game that is currently being played on the channel.
     */
    get categoryId(): string;
    /**
     * The name of the game that is currently being played on the channel.
     */
    get categoryName(): string;
    /**
     * Gets more information about the game that is currently being played on the channel.
     */
    getGame(): Promise<HelixGame | null>;
    /**
     * Whether the channel is flagged as suitable for mature audiences only.
     */
    get isMature(): boolean;
}
//# sourceMappingURL=EventSubChannelUpdateEvent.d.ts.map