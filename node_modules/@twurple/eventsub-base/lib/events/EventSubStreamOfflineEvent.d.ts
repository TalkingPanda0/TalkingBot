import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubStreamOfflineEventData } from './EventSubStreamOfflineEvent.external';
/**
 * An EventSub event representing a stream going offline.
 */
export declare class EventSubStreamOfflineEvent extends DataObject<EventSubStreamOfflineEventData> {
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
//# sourceMappingURL=EventSubStreamOfflineEvent.d.ts.map