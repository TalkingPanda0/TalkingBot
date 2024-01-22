"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelCharityCampaignStartEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const EventSubChannelCharityAmount_1 = require("./common/EventSubChannelCharityAmount");
/**
 * An EventSub event representing the start of a charity campaign in a channel.
 */
let EventSubChannelCharityCampaignStartEvent = class EventSubChannelCharityCampaignStartEvent extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * An ID that identifies the charity campaign.
     */
    get id() {
        return this[common_1.rawDataSymbol].id;
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
     * A URL to an image of the of the charity;s logo. The image’s type is PNG and its size is 100px X 100px.
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
     * An object that contains the current amount of donations that the campaign has received.
     */
    get currentAmount() {
        return new EventSubChannelCharityAmount_1.EventSubChannelCharityAmount(this[common_1.rawDataSymbol].current_amount);
    }
    /**
     * An object that contains the campaign’s target fundraising goal.
     */
    get targetAmount() {
        return new EventSubChannelCharityAmount_1.EventSubChannelCharityAmount(this[common_1.rawDataSymbol].target_amount);
    }
    /**
     * The date/time when the charity campaign started.
     */
    get startDate() {
        return new Date(this[common_1.rawDataSymbol].started_at);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubChannelCharityCampaignStartEvent.prototype, "_client", void 0);
EventSubChannelCharityCampaignStartEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubChannelCharityCampaignStartEvent', 'id')
], EventSubChannelCharityCampaignStartEvent);
exports.EventSubChannelCharityCampaignStartEvent = EventSubChannelCharityCampaignStartEvent;
