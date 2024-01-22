import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubStreamOnlineEvent } from "../events/EventSubStreamOnlineEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubStreamOnlineSubscription = class EventSubStreamOnlineSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'streamup';
    }
    get id() {
        return `stream.online.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubStreamOnlineEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToStreamOnlineEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubStreamOnlineSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubStreamOnlineSubscription);
export { EventSubStreamOnlineSubscription };
