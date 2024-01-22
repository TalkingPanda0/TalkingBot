"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelCharityDonationEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const EventSubChannelCharityAmount_1 = require("./common/EventSubChannelCharityAmount");
/**
 * An EventSub event representing a donation to a charity campaign in a channel.
 */
let EventSubChannelCharityDonationEvent = class EventSubChannelCharityDonationEvent extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * An ID that identifies the charity campaign.
     */
    get campaignId() {
        return this[common_1.rawDataSymbol].campaign_id;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this[common_1.rawDataSymbol].broadcaster_login;
    }
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName() {
        return this[common_1.rawDataSymbol].broadcaster_name;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_id));
    }
    /**
     * The ID of the donating user.
     */
    get donorId() {
        return this[common_1.rawDataSymbol].user_id;
    }
    /**
     * The name of the donating user.
     */
    get donorName() {
        return this[common_1.rawDataSymbol].user_login;
    }
    /**
     * The display name of the donating user.
     */
    get donorDisplayName() {
        return this[common_1.rawDataSymbol].user_name;
    }
    /**
     * Gets more information about the donating user.
     */
    async getDonor() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].user_id));
    }
    /**
     * The name of the charity.
     */
    get charityName() {
        return this[common_1.rawDataSymbol].charity_name;
    }
    /**
     * A description of the charity.
     */
    get charityDescription() {
        return this[common_1.rawDataSymbol].charity_description;
    }
    /**
     * A URL to an image of the charity's logo. The image’s type is PNG and its size is 100px X 100px.
     */
    get charityLogo() {
        return this[common_1.rawDataSymbol].charity_logo;
    }
    /**
     * A URL to the charity’s website.
     */
    get charityWebsite() {
        return this[common_1.rawDataSymbol].charity_website;
    }
    /**
     * An object that contains the amount of money that the user donated.
     */
    get amount() {
        return new EventSubChannelCharityAmount_1.EventSubChannelCharityAmount(this[common_1.rawDataSymbol].amount);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubChannelCharityDonationEvent.prototype, "_client", void 0);
EventSubChannelCharityDonationEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubChannelCharityDonationEvent', 'broadcasterId')
], EventSubChannelCharityDonationEvent);
exports.EventSubChannelCharityDonationEvent = EventSubChannelCharityDonationEvent;
