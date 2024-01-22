import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
import { EventSubChannelCharityAmount } from "./common/EventSubChannelCharityAmount.mjs";
/**
 * An EventSub event representing a donation to a charity campaign in a channel.
 */
let EventSubChannelCharityDonationEvent = class EventSubChannelCharityDonationEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * An ID that identifies the charity campaign.
     */
    get campaignId() {
        return this[rawDataSymbol].campaign_id;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_id;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_login;
    }
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName() {
        return this[rawDataSymbol].broadcaster_name;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].broadcaster_id));
    }
    /**
     * The ID of the donating user.
     */
    get donorId() {
        return this[rawDataSymbol].user_id;
    }
    /**
     * The name of the donating user.
     */
    get donorName() {
        return this[rawDataSymbol].user_login;
    }
    /**
     * The display name of the donating user.
     */
    get donorDisplayName() {
        return this[rawDataSymbol].user_name;
    }
    /**
     * Gets more information about the donating user.
     */
    async getDonor() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].user_id));
    }
    /**
     * The name of the charity.
     */
    get charityName() {
        return this[rawDataSymbol].charity_name;
    }
    /**
     * A description of the charity.
     */
    get charityDescription() {
        return this[rawDataSymbol].charity_description;
    }
    /**
     * A URL to an image of the charity's logo. The image’s type is PNG and its size is 100px X 100px.
     */
    get charityLogo() {
        return this[rawDataSymbol].charity_logo;
    }
    /**
     * A URL to the charity’s website.
     */
    get charityWebsite() {
        return this[rawDataSymbol].charity_website;
    }
    /**
     * An object that contains the amount of money that the user donated.
     */
    get amount() {
        return new EventSubChannelCharityAmount(this[rawDataSymbol].amount);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelCharityDonationEvent.prototype, "_client", void 0);
EventSubChannelCharityDonationEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelCharityDonationEvent', 'broadcasterId')
], EventSubChannelCharityDonationEvent);
export { EventSubChannelCharityDonationEvent };
