import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelModeratorEvent } from "../events/EventSubChannelModeratorEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelModeratorRemoveSubscription = class EventSubChannelModeratorRemoveSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'remove-moderator';
    }
    get id() {
        return `channel.moderator.remove.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelModeratorEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelModeratorRemoveEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelModeratorRemoveSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelModeratorRemoveSubscription);
export { EventSubChannelModeratorRemoveSubscription };
