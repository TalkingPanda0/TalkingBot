import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubDropEntitlementGrantEvent } from "../events/EventSubDropEntitlementGrantEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubDropEntitlementGrantSubscription = class EventSubDropEntitlementGrantSubscription extends EventSubSubscription {
    constructor(handler, client, _filter) {
        super(handler, client);
        this._filter = _filter;
        /** @protected */ this._cliName = 'drop';
        this.authUserId = null;
    }
    get id() {
        var _a, _b;
        return `drop.entitlement.grant.${this._filter.organizationId}.${(_a = this._filter.categoryId) !== null && _a !== void 0 ? _a : 'all'}.${(_b = this._filter.campaignId) !== null && _b !== void 0 ? _b : 'all'}`;
    }
    transformData(data) {
        return new EventSubDropEntitlementGrantEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToDropEntitlementGrantEvents(this._filter, await this._getTransportOptions());
    }
};
EventSubDropEntitlementGrantSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubDropEntitlementGrantSubscription);
export { EventSubDropEntitlementGrantSubscription };
