import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelShieldModeEndEvent } from "../events/EventSubChannelShieldModeEndEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelShieldModeEndSubscription = class EventSubChannelShieldModeEndSubscription extends EventSubSubscription {
    constructor(handler, client, _userId, _moderatorId) {
        super(handler, client);
        this._userId = _userId;
        this._moderatorId = _moderatorId;
        /** @protected */ this._cliName = '';
    }
    get id() {
        return `channel.shield_mode.end.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelShieldModeEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.asUser(this._moderatorId, async (ctx) => await ctx.eventSub.subscribeToChannelShieldModeEndEvents(this._userId, await this._getTransportOptions()));
    }
};
EventSubChannelShieldModeEndSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelShieldModeEndSubscription);
export { EventSubChannelShieldModeEndSubscription };
