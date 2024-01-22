import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelRaidEventData } from './EventSubChannelRaidEvent.external';
/**
 * An EventSub event representing a broadcaster raiding another broadcaster.
 */
export declare class EventSubChannelRaidEvent extends DataObject<EventSubChannelRaidEventData> {
    /**
     * The ID of the raiding broadcaster.
     */
    get raidingBroadcasterId(): string;
    /**
     * The name of the raiding broadcaster.
     */
    get raidingBroadcasterName(): string;
    /**
     * The display name of the raiding broadcaster.
     */
    get raidingBroadcasterDisplayName(): string;
    /**
     * Gets more information about the raiding broadcaster.
     */
    getRaidingBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the raided broadcaster.
     */
    get raidedBroadcasterId(): string;
    /**
     * The name of the raided broadcaster.
     */
    get raidedBroadcasterName(): string;
    /**
     * The display name of the raided broadcaster.
     */
    get raidedBroadcasterDisplayName(): string;
    /**
     * Gets more information about the raided broadcaster.
     */
    getRaidedBroadcaster(): Promise<HelixUser>;
    /**
     * The amount of viewers in the raid.
     */
    get viewers(): number;
}
//# sourceMappingURL=EventSubChannelRaidEvent.d.ts.map