import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelRaidEvent } from "../events/EventSubChannelRaidEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelRaidSubscription = class EventSubChannelRaidSubscription extends EventSubSubscription {
    constructor(handler, client, _userId, _direction) {
        super(handler, client);
        this._userId = _userId;
        this._direction = _direction;
        /** @protected */ this._cliName = 'raid';
    }
    get id() {
        return `channel.raid.${this._direction}.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelRaidEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        if (this._direction === 'from') {
            return await this._client._apiClient.eventSub.subscribeToChannelRaidEventsFrom(this._userId, await this._getTransportOptions());
        }
        return await this._client._apiClient.eventSub.subscribeToChannelRaidEventsTo(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelRaidSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelRaidSubscription);
export { EventSubChannelRaidSubscription };
