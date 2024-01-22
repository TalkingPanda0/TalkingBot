import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubUserAuthorizationGrantEvent } from "../events/EventSubUserAuthorizationGrantEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubUserAuthorizationGrantSubscription = class EventSubUserAuthorizationGrantSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'grant';
        this.authUserId = null;
    }
    get id() {
        return `user.authorization.grant.${this._userId}`;
    }
    transformData(data) {
        return new EventSubUserAuthorizationGrantEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToUserAuthorizationGrantEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubUserAuthorizationGrantSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubUserAuthorizationGrantSubscription);
export { EventSubUserAuthorizationGrantSubscription };
