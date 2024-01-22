import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelSubscriptionGiftEvent } from "../events/EventSubChannelSubscriptionGiftEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelSubscriptionGiftSubscription = class EventSubChannelSubscriptionGiftSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'gift';
    }
    get id() {
        return `channel.subscription.gift.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelSubscriptionGiftEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelSubscriptionGiftEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelSubscriptionGiftSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelSubscriptionGiftSubscription);
export { EventSubChannelSubscriptionGiftSubscription };
