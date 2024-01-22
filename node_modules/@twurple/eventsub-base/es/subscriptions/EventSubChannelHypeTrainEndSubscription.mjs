import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelHypeTrainEndEvent } from "../events/EventSubChannelHypeTrainEndEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelHypeTrainEndSubscription = class EventSubChannelHypeTrainEndSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'hype-train-end';
    }
    get id() {
        return `channel.hype_train.end.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelHypeTrainEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelHypeTrainEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelHypeTrainEndSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelHypeTrainEndSubscription);
export { EventSubChannelHypeTrainEndSubscription };
