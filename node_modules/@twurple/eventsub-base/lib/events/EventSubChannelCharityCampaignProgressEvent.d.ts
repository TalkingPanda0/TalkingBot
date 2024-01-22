import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelCharityAmount } from './common/EventSubChannelCharityAmount';
import { type EventSubChannelCharityCampaignProgressEventData } from './EventSubChannelCharityCampaignProgressEvent.external';
/**
 * An EventSub event representing progress of a charity campaign in a channel.
 */
export declare class EventSubChannelCharityCampaignProgressEvent extends DataObject<EventSubChannelCharityCampaignProgressEventData> {
    /**
     * An ID that identifies the charity campaign.
     */
    get id(): string;
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
     * The name of the charity.
     */
    get charityName(): string;
    /**
     * A description of the charity.
     */
    get charityDescription(): string;
    /**
     * A URL to an image of the of the charity;s logo. The image’s type is PNG and its size is 100px X 100px.
     */
    get charityLogo(): string;
    /**
     * A URL to the charity’s website.
     */
    get charityWebsite(): string;
    /**
     * An object that contains the current amount of donations that the campaign has received.
     */
    get currentAmount(): EventSubChannelCharityAmount;
    /**
     * An object that contains the campaign’s target fundraising goal.
     */
    get targetAmount(): EventSubChannelCharityAmount;
}
//# sourceMappingURL=EventSubChannelCharityCampaignProgressEvent.d.ts.map