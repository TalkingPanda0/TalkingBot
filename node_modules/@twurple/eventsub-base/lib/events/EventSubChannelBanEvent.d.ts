import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelBanEventData } from './EventSubChannelBanEvent.external';
/**
 * An EventSub event representing a user being banned in a channel.
 */
export declare class EventSubChannelBanEvent extends DataObject<EventSubChannelBanEventData> {
    /**
     * The ID of the banned user.
     */
    get userId(): string;
    /**
     * The name of the banned user.
     */
    get userName(): string;
    /**
     * The display name of the banned user.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the banned user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The ID of the broadcaster from whose chat the user was banned.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster from whose chat the user was banned.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster from whose chat the user was banned.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the moderator who issued the ban/timeout.
     */
    get moderatorId(): string;
    /**
     * The name of the moderator who issued the ban/timeout.
     */
    get moderatorName(): string;
    /**
     * The display name of the moderator who issued the ban/timeout.
     */
    get moderatorDisplayName(): string;
    /**
     * Gets more information about the moderator.
     */
    getModerator(): Promise<HelixUser>;
    /**
     * The reason behind the ban.
     */
    get reason(): string;
    /**
     * The date and time when the user was banned or put in a timeout.
     */
    get startDate(): Date;
    /**
     * If it is a timeout, the date and time when the timeout will end. Will be null if permanent ban.
     */
    get endDate(): Date | null;
    /**
     * Whether the ban is permanent.
     */
    get isPermanent(): boolean;
}
//# sourceMappingURL=EventSubChannelBanEvent.d.ts.map