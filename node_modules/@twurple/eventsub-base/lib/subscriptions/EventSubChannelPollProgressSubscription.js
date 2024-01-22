"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelPollProgressSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelPollProgressEvent_1 = require("../events/EventSubChannelPollProgressEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelPollProgressSubscription = class EventSubChannelPollProgressSubscription extends EventSubSubscription_1.EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'poll-progress';
    }
    get id() {
        return `channel.poll.progress.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelPollProgressEvent_1.EventSubChannelPollProgressEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPollProgressEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPollProgressSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelPollProgressSubscription);
exports.EventSubChannelPollProgressSubscription = EventSubChannelPollProgressSubscription;
