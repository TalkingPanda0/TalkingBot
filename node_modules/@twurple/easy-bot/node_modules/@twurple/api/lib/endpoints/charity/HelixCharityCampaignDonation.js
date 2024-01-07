"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixCharityCampaignDonation = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const HelixCharityCampaignAmount_1 = require("./HelixCharityCampaignAmount");
/**
 * A donation to a charity campaign in a Twitch channel.
 */
let HelixCharityCampaignDonation = class HelixCharityCampaignDonation extends common_1.DataObject {
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
     * An object that contains the amount of money that the user donated.
     */
    get amount() {
        return new HelixCharityCampaignAmount_1.HelixCharityCampaignAmount(this[common_1.rawDataSymbol].amount);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixCharityCampaignDonation.prototype, "_client", void 0);
HelixCharityCampaignDonation = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixCharityCampaignDonation')
], HelixCharityCampaignDonation);
exports.HelixCharityCampaignDonation = HelixCharityCampaignDonation;
