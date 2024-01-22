import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelShoutoutReceiveEventData } from './EventSubChannelShoutoutReceiveEvent.external';
/**
 * An EventSub event representing a broadcaster being shouted out by another broadcaster.
 */
export declare class EventSubChannelShoutoutReceiveEvent extends DataObject<EventSubChannelShoutoutReceiveEventData> {
    /**
     * The ID of the broadcaster who received the shoutout.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster who received the shoutout.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster who received the shoutout.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster who received the shoutout.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterId(): string;
    /**
     * The name of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterName(): string;
    /**
     * The display name of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster who sent the shoutout.
     */
    getShoutingOutBroadcaster(): Promise<HelixUser>;
    /**
     * The amount of viewers who were watching the sending broadcaster's stream at the time of the shoutout.
     */
    get viewerCount(): number;
    /**
     * The Date when the shoutout was sent.
     */
    get startDate(): Date;
}
//# sourceMappingURL=EventSubChannelShoutoutReceiveEvent.d.ts.map