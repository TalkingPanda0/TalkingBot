import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a drop entitlement grant.
 */
let EventSubDropEntitlementGrantEvent = class EventSubDropEntitlementGrantEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the organization.
     */
    get organizationId() {
        return this[rawDataSymbol].organization_id;
    }
    /**
     * The ID of the category/game.
     */
    get categoryId() {
        return this[rawDataSymbol].category_id;
    }
    /**
     * The name of the category/game.
     */
    get categoryName() {
        return this[rawDataSymbol].category_name;
    }
    /**
     * Gets more information about the category/game.
     */
    async getCategory() {
        return checkRelationAssertion(await this._client.games.getGameById(this[rawDataSymbol].category_id));
    }
    /**
     * The ID of the campaign.
     */
    get campaignId() {
        return this[rawDataSymbol].campaign_id;
    }
    /**
     * The ID of the entitled user.
     */
    get userId() {
        return this[rawDataSymbol].user_id;
    }
    /**
     * The name of the entitled user.
     */
    get userName() {
        return this[rawDataSymbol].user_login;
    }
    /**
     * The display name of the entitled user.
     */
    get userDisplayName() {
        return this[rawDataSymbol].user_name;
    }
    /**
     * Gets more information about the entitled user.
     */
    async getUser() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].user_id));
    }
    /**
     * The ID of the entitlement.
     */
    get entitlementId() {
        return this[rawDataSymbol].entitlement_id;
    }
    /**
     * The ID of the reward.
     */
    get rewardId() {
        return this[rawDataSymbol].benefit_id;
    }
    /**
     * The date when the entitlement was granted.
     */
    get grantDate() {
        return new Date(this[rawDataSymbol].created_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubDropEntitlementGrantEvent.prototype, "_client", void 0);
EventSubDropEntitlementGrantEvent = __decorate([
    rtfm('eventsub-base', 'EventSubDropEntitlementGrantEvent', 'entitlementId')
], EventSubDropEntitlementGrantEvent);
export { EventSubDropEntitlementGrantEvent };
