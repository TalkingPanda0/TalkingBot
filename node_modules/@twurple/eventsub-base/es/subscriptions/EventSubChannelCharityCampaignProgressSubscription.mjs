import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelCharityCampaignProgressEvent } from "../events/EventSubChannelCharityCampaignProgressEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelCharityCampaignProgressSubscription = class EventSubChannelCharityCampaignProgressSubscription extends EventSubSubscription {
    constructor(handler, client, _userId) {
        super(handler, client);
        this._userId = _userId;
        /** @protected */ this._cliName = 'charity-progress';
    }
    get id() {
        return `channel.charity_campaign.progress.${this._userId}`;
    }
    get authUserId() {
        return this._userId;
    }
    transformData(data) {
        return new EventSubChannelCharityCampaignProgressEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.eventSub.subscribeToChannelCharityCampaignProgressEvents(this._userId, await this._getTransportOptions());
    }
};
EventSubChannelCharityCampaignProgressSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelCharityCampaignProgressSubscription);
export { EventSubChannelCharityCampaignProgressSubscription };
