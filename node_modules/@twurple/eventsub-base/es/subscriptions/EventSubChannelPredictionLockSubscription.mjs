import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelPredictionLockEvent } from "../events/EventSubChannelPredictionLockEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelPredictionLockSubscription = class EventSubChannelPredictionLockSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'prediction-lock';
    }
    get id() {
        return `channel.prediction.lock.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelPredictionLockEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPredictionLockEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPredictionLockSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelPredictionLockSubscription);
export { EventSubChannelPredictionLockSubscription };
