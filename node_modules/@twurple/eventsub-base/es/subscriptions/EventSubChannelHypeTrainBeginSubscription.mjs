import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelHypeTrainBeginEvent } from "../events/EventSubChannelHypeTrainBeginEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelHypeTrainBeginSubscription = class EventSubChannelHypeTrainBeginSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'hype-train-begin';
    }
    get id() {
        return `channel.hype_train.begin.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelHypeTrainBeginEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelHypeTrainBeginEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelHypeTrainBeginSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelHypeTrainBeginSubscription);
export { EventSubChannelHypeTrainBeginSubscription };
