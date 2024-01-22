import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelSubscriptionMessageEvent } from "../events/EventSubChannelSubscriptionMessageEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelSubscriptionMessageSubscription = class EventSubChannelSubscriptionMessageSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'subscribe-message';
    }
    get id() {
        return `channel.subscription.message.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelSubscriptionMessageEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelSubscriptionMessageEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelSubscriptionMessageSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelSubscriptionMessageSubscription);
export { EventSubChannelSubscriptionMessageSubscription };
