"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelSubscriptionEndSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelSubscriptionEndEvent_1 = require("../events/EventSubChannelSubscriptionEndEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelSubscriptionEndSubscription = class EventSubChannelSubscriptionEndSubscription extends EventSubSubscription_1.EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'unsubscribe';
    }
    get id() {
        return `channel.subscription.end.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelSubscriptionEndEvent_1.EventSubChannelSubscriptionEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelSubscriptionEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelSubscriptionEndSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelSubscriptionEndSubscription);
exports.EventSubChannelSubscriptionEndSubscription = EventSubChannelSubscriptionEndSubscription;
