import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelCharityDonationEvent } from "../events/EventSubChannelCharityDonationEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelCharityDonationSubscription = class EventSubChannelCharityDonationSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'charity-donation';
    }
    get id() {
        return `channel.charity_campaign.donate.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelCharityDonationEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelCharityDonationEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelCharityDonationSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelCharityDonationSubscription);
export { EventSubChannelCharityDonationSubscription };
