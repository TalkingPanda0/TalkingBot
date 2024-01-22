import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelShoutoutReceiveEvent } from "../events/EventSubChannelShoutoutReceiveEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelShoutoutReceiveSubscription = class EventSubChannelShoutoutReceiveSubscription extends EventSubSubscription {
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
        return new EventSubChannelShoutoutReceiveEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.asUser(this._moderatorId, async (ctx) => await ctx.eventSub.subscribeToChannelShoutoutReceiveEvents(this._userId, await this._getTransportOptions()));
    }
};
EventSubChannelShoutoutReceiveSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelShoutoutReceiveSubscription);
export { EventSubChannelShoutoutReceiveSubscription };
