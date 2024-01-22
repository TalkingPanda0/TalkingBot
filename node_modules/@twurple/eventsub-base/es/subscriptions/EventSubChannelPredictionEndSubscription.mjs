import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelPredictionEndEvent } from "../events/EventSubChannelPredictionEndEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelPredictionEndSubscription = class EventSubChannelPredictionEndSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'prediction-end';
    }
    get id() {
        return `channel.prediction.end.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelPredictionEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPredictionEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPredictionEndSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelPredictionEndSubscription);
export { EventSubChannelPredictionEndSubscription };
