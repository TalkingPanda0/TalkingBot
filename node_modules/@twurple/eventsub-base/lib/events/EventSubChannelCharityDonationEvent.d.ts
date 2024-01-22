import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { EventSubChannelCharityAmount } from './common/EventSubChannelCharityAmount';
import { type EventSubChannelCharityDonationEventData } from './EventSubChannelCharityDonationEvent.external';
/**
 * An EventSub event representing a donation to a charity campaign in a channel.
 */
export declare class EventSubChannelCharityDonationEvent extends DataObject<EventSubChannelCharityDonationEventData> {
    /**
     * An ID that identifies the charity campaign.
     */
    get campaignId(): string;
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
     * The ID of the donating user.
     */
    get donorId(): string;
    /**
     * The name of the donating user.
     */
    get donorName(): string;
    /**
     * The display name of the donating user.
     */
    get donorDisplayName(): string;
    /**
     * Gets more information about the donating user.
     */
    getDonor(): Promise<HelixUser>;
    /**
     * The name of the charity.
     */
    get charityName(): string;
    /**
     * A description of the charity.
     */
    get charityDescription(): string;
    /**
     * A URL to an image of the charity's logo. The image’s type is PNG and its size is 100px X 100px.
     */
    get charityLogo(): string;
    /**
     * A URL to the charity’s website.
     */
    get charityWebsite(): string;
    /**
     * An object that contains the amount of money that the user donated.
     */
    get amount(): EventSubChannelCharityAmount;
}
//# sourceMappingURL=EventSubChannelCharityDonationEvent.d.ts.map