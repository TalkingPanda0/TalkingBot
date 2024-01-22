"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelPollEndSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelPollEndEvent_1 = require("../events/EventSubChannelPollEndEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelPollEndSubscription = class EventSubChannelPollEndSubscription extends EventSubSubscription_1.EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'poll-end';
    }
    get id() {
        return `channel.poll.end.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelPollEndEvent_1.EventSubChannelPollEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPollEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPollEndSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelPollEndSubscription);
exports.EventSubChannelPollEndSubscription = EventSubChannelPollEndSubscription;
