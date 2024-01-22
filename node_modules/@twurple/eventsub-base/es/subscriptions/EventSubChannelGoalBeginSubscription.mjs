import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelGoalBeginEvent } from "../events/EventSubChannelGoalBeginEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelGoalBeginSubscription = class EventSubChannelGoalBeginSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'goal-begin';
    }
    get id() {
        return `channel.goal.begin.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelGoalBeginEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelGoalBeginEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelGoalBeginSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelGoalBeginSubscription);
export { EventSubChannelGoalBeginSubscription };
