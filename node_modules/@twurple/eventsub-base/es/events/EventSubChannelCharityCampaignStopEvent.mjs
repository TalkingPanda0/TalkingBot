import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
import { EventSubChannelCharityAmount } from "./common/EventSubChannelCharityAmount.mjs";
/**
 * An EventSub event representing the end of a charity campaign in a channel.
 */
let EventSubChannelCharityCampaignStopEvent = class EventSubChannelCharityCampaignStopEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * An ID that identifies the charity campaign.
     */
    get id() {
        return this[rawDataSymbol].id;
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
     * A URL to an image of the of the charity;s logo. The image’s type is PNG and its size is 100px X 100px.
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
     * An object that contains the final amount of donations that the campaign has received.
     */
    get currentAmount() {
        return new EventSubChannelCharityAmount(this[rawDataSymbol].current_amount);
    }
    /**
     * An object that contains the campaign’s target fundraising goal.
     */
    get targetAmount() {
        return new EventSubChannelCharityAmount(this[rawDataSymbol].target_amount);
    }
    /**
     * The date/time when the charity campaign ended.
     */
    get endDate() {
        return new Date(this[rawDataSymbol].stopped_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelCharityCampaignStopEvent.prototype, "_client", void 0);
EventSubChannelCharityCampaignStopEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelCharityCampaignStopEvent', 'id')
], EventSubChannelCharityCampaignStopEvent);
export { EventSubChannelCharityCampaignStopEvent };
