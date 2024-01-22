"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelGoalProgressSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelGoalProgressEvent_1 = require("../events/EventSubChannelGoalProgressEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelGoalProgressSubscription = class EventSubChannelGoalProgressSubscription extends EventSubSubscription_1.EventSubSubscription {
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
        return new EventSubChannelGoalProgressEvent_1.EventSubChannelGoalProgressEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelGoalProgressEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelGoalProgressSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelGoalProgressSubscription);
exports.EventSubChannelGoalProgressSubscription = EventSubChannelGoalProgressSubscription;
