import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelCheerEvent } from "../events/EventSubChannelCheerEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelCheerSubscription = class EventSubChannelCheerSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'cheer';
    }
    get id() {
        return `channel.cheer.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelCheerEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelCheerEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelCheerSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelCheerSubscription);
export { EventSubChannelCheerSubscription };
