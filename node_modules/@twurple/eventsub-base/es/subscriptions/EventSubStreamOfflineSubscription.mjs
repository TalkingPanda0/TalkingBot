import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubStreamOfflineEvent } from "../events/EventSubStreamOfflineEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubStreamOfflineSubscription = class EventSubStreamOfflineSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'streamdown';
    }
    get id() {
        return `stream.offline.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubStreamOfflineEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToStreamOfflineEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubStreamOfflineSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubStreamOfflineSubscription);
export { EventSubStreamOfflineSubscription };
