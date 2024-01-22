import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelShoutoutCreateEvent } from "../events/EventSubChannelShoutoutCreateEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelShoutoutCreateSubscription = class EventSubChannelShoutoutCreateSubscription extends EventSubSubscription {
    constructor(handler, client, _userId, _moderatorId) {
        super(handler, client);
        this._userId = _userId;
        this._moderatorId = _moderatorId;
        /** @protected */ this._cliName = 'shoutout-create';
    }
    get id() {
        return `channel.shoutout.create.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelShoutoutCreateEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.asUser(this._moderatorId, async (ctx) => await ctx.eventSub.subscribeToChannelShoutoutCreateEvents(this._userId, await this._getTransportOptions()));
    }
};
EventSubChannelShoutoutCreateSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelShoutoutCreateSubscription);
export { EventSubChannelShoutoutCreateSubscription };
