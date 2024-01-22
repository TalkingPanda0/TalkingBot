import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelUpdateEvent } from "../events/EventSubChannelUpdateEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelUpdateSubscription = class EventSubChannelUpdateSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'stream-change';
    }
    get id() {
        return `channel.update.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelUpdateEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelUpdateEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelUpdateSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelUpdateSubscription);
export { EventSubChannelUpdateSubscription };
