"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubDropEntitlementGrantSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubDropEntitlementGrantEvent_1 = require("../events/EventSubDropEntitlementGrantEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubDropEntitlementGrantSubscription = class EventSubDropEntitlementGrantSubscription extends EventSubSubscription_1.EventSubSubscription {
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
        return new EventSubDropEntitlementGrantEvent_1.EventSubDropEntitlementGrantEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToDropEntitlementGrantEvents(this._filter, await this._getTransportOptions());
    }
};
EventSubDropEntitlementGrantSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubDropEntitlementGrantSubscription);
exports.EventSubDropEntitlementGrantSubscription = EventSubDropEntitlementGrantSubscription;
