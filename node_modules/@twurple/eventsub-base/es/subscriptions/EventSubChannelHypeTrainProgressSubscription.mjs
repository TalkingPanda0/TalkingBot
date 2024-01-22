import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelHypeTrainProgressEvent } from "../events/EventSubChannelHypeTrainProgressEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelHypeTrainProgressSubscription = class EventSubChannelHypeTrainProgressSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'hype-train-progress';
    }
    get id() {
        return `channel.hype_train.progress.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelHypeTrainProgressEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelHypeTrainProgressEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelHypeTrainProgressSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelHypeTrainProgressSubscription);
export { EventSubChannelHypeTrainProgressSubscription };
