import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelAdBreakBeginEventData } from './EventSubChannelAdBreakBeginEvent.external';
/**
 * An EventSub event representing an ad break beginning in a broadcaster channel.
 */
export declare class EventSubChannelAdBreakBeginEvent extends DataObject<EventSubChannelAdBreakBeginEventData> {
    /**
     * The broadcaster's user ID for the channel the ad was run on.
     */
    get broadcasterId(): string;
    /**
     * The broadcaster's user login for the channel the ad was run on.
     */
    get broadcasterName(): string;
    /**
     * The broadcaster's user display name for the channel the ad was run on.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the user that requested the ad. For automatic ads, this will be the ID of the broadcaster.
     */
    get requesterId(): string;
    /**
     * The login of the user that requested the ad.
     */
    get requesterName(): string;
    /**
     * The display name of the user that requested the ad.
     */
    get requesterDisplayName(): string;
    /**
     * Gets more information about the user that requested the ad.
     */
    getRequester(): Promise<HelixUser>;
    /**
     * Length in seconds of the mid-roll ad break requested.
     */
    get durationSeconds(): number;
    /**
     * The date/time when the ad break started.
     */
    get startDate(): Date;
    /**
     * Indicates if the ad was automatically scheduled via Ads Manager.
     */
    get isAutomatic(): boolean;
}
//# sourceMappingURL=EventSubChannelAdBreakBeginEvent.d.ts.map