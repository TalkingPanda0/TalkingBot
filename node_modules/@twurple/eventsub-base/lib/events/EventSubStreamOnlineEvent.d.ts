import type { HelixStream, HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubStreamOnlineEventData, type EventSubStreamOnlineEventStreamType } from './EventSubStreamOnlineEvent.external';
/**
 * An EventSub event representing a stream going live.
 */
export declare class EventSubStreamOnlineEvent extends DataObject<EventSubStreamOnlineEventData> {
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
     * Gets more information about the stream.
     *
     * This may sometimes return null, as the Helix API might be behind due to caching on Twitch's side.
     */
    getStream(): Promise<HelixStream | null>;
    /**
     * The ID of the stream going live.
     */
    get id(): string;
    /**
     * The type of the stream going live.
     */
    get type(): EventSubStreamOnlineEventStreamType;
    /**
     * The date and time when the stream was started.
     */
    get startDate(): Date;
}
//# sourceMappingURL=EventSubStreamOnlineEvent.d.ts.map