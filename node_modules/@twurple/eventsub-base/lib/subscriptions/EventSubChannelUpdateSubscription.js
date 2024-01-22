"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelUpdateSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelUpdateEvent_1 = require("../events/EventSubChannelUpdateEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelUpdateSubscription = class EventSubChannelUpdateSubscription extends EventSubSubscription_1.EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'stream-change';
    }
    get id() {
        return `channel.update.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelUpdateEvent_1.EventSubChannelUpdateEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelUpdateEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelUpdateSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelUpdateSubscription);
exports.EventSubChannelUpdateSubscription = EventSubChannelUpdateSubscription;
