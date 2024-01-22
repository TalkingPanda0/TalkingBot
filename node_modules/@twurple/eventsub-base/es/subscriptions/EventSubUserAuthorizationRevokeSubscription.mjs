import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubUserAuthorizationRevokeEvent } from "../events/EventSubUserAuthorizationRevokeEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubUserAuthorizationRevokeSubscription = class EventSubUserAuthorizationRevokeSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'revoke';
        this.authUserId = null;
    }
    get id() {
        return `user.authorization.revoke.${this._userId}`;
    }
    transformData(data) {
        return new EventSubUserAuthorizationRevokeEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToUserAuthorizationRevokeEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubUserAuthorizationRevokeSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubUserAuthorizationRevokeSubscription);
export { EventSubUserAuthorizationRevokeSubscription };
