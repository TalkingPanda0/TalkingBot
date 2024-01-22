import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelPollProgressEvent } from "../events/EventSubChannelPollProgressEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelPollProgressSubscription = class EventSubChannelPollProgressSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'poll-progress';
    }
    get id() {
        return `channel.poll.progress.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelPollProgressEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPollProgressEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPollProgressSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelPollProgressSubscription);
export { EventSubChannelPollProgressSubscription };
