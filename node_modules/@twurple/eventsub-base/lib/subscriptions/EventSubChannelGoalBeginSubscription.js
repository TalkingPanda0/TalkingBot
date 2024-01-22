"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelGoalBeginSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelGoalBeginEvent_1 = require("../events/EventSubChannelGoalBeginEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelGoalBeginSubscription = class EventSubChannelGoalBeginSubscription extends EventSubSubscription_1.EventSubSubscription {
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
        return new EventSubChannelGoalBeginEvent_1.EventSubChannelGoalBeginEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelGoalBeginEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelGoalBeginSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelGoalBeginSubscription);
exports.EventSubChannelGoalBeginSubscription = EventSubChannelGoalBeginSubscription;
