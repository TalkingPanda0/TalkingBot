import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelSubscriptionEndEvent } from "../events/EventSubChannelSubscriptionEndEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelSubscriptionEndSubscription = class EventSubChannelSubscriptionEndSubscription extends EventSubSubscription {
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
        return new EventSubChannelSubscriptionEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelSubscriptionEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelSubscriptionEndSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelSubscriptionEndSubscription);
export { EventSubChannelSubscriptionEndSubscription };
