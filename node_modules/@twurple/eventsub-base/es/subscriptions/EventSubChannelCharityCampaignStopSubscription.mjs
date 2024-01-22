import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelCharityCampaignStopEvent } from "../events/EventSubChannelCharityCampaignStopEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelCharityCampaignStopSubscription = class EventSubChannelCharityCampaignStopSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'charity-stop';
    }
    get id() {
        return `channel.charity_campaign.stop.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelCharityCampaignStopEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelCharityCampaignStopEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelCharityCampaignStopSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelCharityCampaignStopSubscription);
export { EventSubChannelCharityCampaignStopSubscription };
