import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelAdBreakBeginEvent } from "../events/EventSubChannelAdBreakBeginEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelAdBreakBeginSubscription = class EventSubChannelAdBreakBeginSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'ad-break-begin';
    }
    get id() {
        return `channel.ad_break.begin.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelAdBreakBeginEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelAdBreakBeginEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelAdBreakBeginSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelAdBreakBeginSubscription);
export { EventSubChannelAdBreakBeginSubscription };
