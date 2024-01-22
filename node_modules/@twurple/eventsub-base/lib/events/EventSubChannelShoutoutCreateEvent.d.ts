import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelShoutoutCreateEventData } from './EventSubChannelShoutoutCreateEvent.external';
/**
 * An EventSub event representing a broadcaster shouting out another broadcaster.
 */
export declare class EventSubChannelShoutoutCreateEvent extends DataObject<EventSubChannelShoutoutCreateEventData> {
    /**
     * The ID of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster from whose channel the shoutout was sent.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the moderator who sent the shoutout.
     */
    get moderatorId(): string;
    /**
     * The name of the moderator who sent the shoutout.
     */
    get moderatorName(): string;
    /**
     * The display name of the moderator who sent the shoutout.
     */
    get moderatorDisplayName(): string;
    /**
     * Gets more information about the moderator who sent the shoutout.
     */
    getModerator(): Promise<HelixUser>;
    /**
     * The ID of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterId(): string;
    /**
     * The name of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterName(): string;
    /**
     * The display name of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster who was shoutout out.
     */
    getShoutedOutBroadcaster(): Promise<HelixUser>;
    /**
     * The amount of viewers who were watching the sending broadcaster's stream at the time they sent the shoutout.
     */
    get viewerCount(): number;
    /**
     * The Date when the shoutout was sent.
     */
    get startDate(): Date;
    /**
     * The Date when the broadcaster may send a shoutout to a different broadcaster.
     */
    get cooldownEndDate(): Date;
    /**
     * The Date when the broadcaster may send another shoutout to the same broadcaster.
     */
    get targetCooldownEndDate(): Date;
}
//# sourceMappingURL=EventSubChannelShoutoutCreateEvent.d.ts.map