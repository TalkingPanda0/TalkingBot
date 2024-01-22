import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelPollBeginEvent } from "../events/EventSubChannelPollBeginEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelPollBeginSubscription = class EventSubChannelPollBeginSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'poll-begin';
    }
    get id() {
        return `channel.poll.begin.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelPollBeginEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPollBeginEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPollBeginSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelPollBeginSubscription);
export { EventSubChannelPollBeginSubscription };
