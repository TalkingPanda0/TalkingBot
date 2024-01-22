import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelPollEndEvent } from "../events/EventSubChannelPollEndEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelPollEndSubscription = class EventSubChannelPollEndSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'poll-end';
    }
    get id() {
        return `channel.poll.end.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelPollEndEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelPollEndEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelPollEndSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelPollEndSubscription);
export { EventSubChannelPollEndSubscription };
