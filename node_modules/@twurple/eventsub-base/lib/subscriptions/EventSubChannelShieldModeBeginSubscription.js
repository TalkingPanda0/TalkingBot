"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelShieldModeBeginSubscription = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const EventSubChannelShieldModeBeginEvent_1 = require("../events/EventSubChannelShieldModeBeginEvent");
const EventSubSubscription_1 = require("./EventSubSubscription");
/** @internal */
let EventSubChannelShieldModeBeginSubscription = class EventSubChannelShieldModeBeginSubscription extends EventSubSubscription_1.EventSubSubscription {
    constructor(handler, client, _userId, _moderatorId) {
        super(handler, client);
        this._userId = _userId;
        this._moderatorId = _moderatorId;
        /** @protected */ this._cliName = '';
    }
    get id() {
        return `channel.shield_mode.begin.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelShieldModeBeginEvent_1.EventSubChannelShieldModeBeginEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.asUser(this._moderatorId, async (ctx) => await ctx.eventSub.subscribeToChannelShieldModeBeginEvents(this._userId, await this._getTransportOptions()));
    }
};
EventSubChannelShieldModeBeginSubscription = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubSubscription')
], EventSubChannelShieldModeBeginSubscription);
exports.EventSubChannelShieldModeBeginSubscription = EventSubChannelShieldModeBeginSubscription;
