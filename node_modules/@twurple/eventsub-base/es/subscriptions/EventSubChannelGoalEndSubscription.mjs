import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelGoalEndEvent } from "../events/EventSubChannelGoalEndEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelGoalEndSubscription = class EventSubChannelGoalEndSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'goal-end';
    }
    get id() {
        return `channel.goal.end.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelGoalEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelGoalEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelGoalEndSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelGoalEndSubscription);
export { EventSubChannelGoalEndSubscription };
