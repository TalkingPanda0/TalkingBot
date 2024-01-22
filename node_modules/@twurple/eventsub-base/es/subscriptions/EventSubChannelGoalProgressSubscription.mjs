import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelGoalProgressEvent } from "../events/EventSubChannelGoalProgressEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelGoalProgressSubscription = class EventSubChannelGoalProgressSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'goal-progress';
    }
    get id() {
        return `channel.goal.progress.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelGoalProgressEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelGoalProgressEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelGoalProgressSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelGoalProgressSubscription);
export { EventSubChannelGoalProgressSubscription };
