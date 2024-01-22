import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelRewardEvent } from "../events/EventSubChannelRewardEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelRewardAddSubscription = class EventSubChannelRewardAddSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'add-reward';
    }
    get id() {
        return `channel.channel_points_custom_reward.add.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelRewardEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelRewardAddEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelRewardAddSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelRewardAddSubscription);
export { EventSubChannelRewardAddSubscription };
