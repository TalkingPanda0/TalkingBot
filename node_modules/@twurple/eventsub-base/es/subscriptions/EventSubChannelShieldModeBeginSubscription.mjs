import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelShieldModeBeginEvent } from "../events/EventSubChannelShieldModeBeginEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelShieldModeBeginSubscription = class EventSubChannelShieldModeBeginSubscription extends EventSubSubscription {
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
        return new EventSubChannelShieldModeBeginEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.asUser(this._moderatorId, async (ctx) => await ctx.eventSub.subscribeToChannelShieldModeBeginEvents(this._userId, await this._getTransportOptions()));
    }
};
EventSubChannelShieldModeBeginSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelShieldModeBeginSubscription);
export { EventSubChannelShieldModeBeginSubscription };
