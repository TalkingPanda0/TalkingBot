"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelPredictionEndSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelPredictionEndEvent_1 = require("../events/EventSubChannelPredictionEndEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelPredictionEndSubscription = class EventSubChannelPredictionEndSubscription extends EventSubSubscription_1.EventSubSubscription {
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
        return new EventSubChannelPredictionEndEvent_1.EventSubChannelPredictionEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPredictionEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPredictionEndSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelPredictionEndSubscription);
exports.EventSubChannelPredictionEndSubscription = EventSubChannelPredictionEndSubscription;
