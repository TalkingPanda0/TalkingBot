"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelShoutoutReceiveSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelShoutoutReceiveEvent_1 = require("../events/EventSubChannelShoutoutReceiveEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelShoutoutReceiveSubscription = class EventSubChannelShoutoutReceiveSubscription extends EventSubSubscription_1.EventSubSubscription {
    constructor(handler, client, _userId, _moderatorId) {
        super(handler, client);
        this._userId = _userId;
        this._moderatorId = _moderatorId;
        /** @protected */ this._cliName = 'shoutout-received';
    }
    get id() {
        return `channel.shoutout.receive.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelShoutoutReceiveEvent_1.EventSubChannelShoutoutReceiveEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.asUser(this._moderatorId, async (ctx) => await ctx.eventSub.subscribeToChannelShoutoutReceiveEvents(this._userId, await this._getTransportOptions()));
    }
};
EventSubChannelShoutoutReceiveSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelShoutoutReceiveSubscription);
exports.EventSubChannelShoutoutReceiveSubscription = EventSubChannelShoutoutReceiveSubscription;
