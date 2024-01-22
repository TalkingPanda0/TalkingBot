import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { EventSubChannelFollowEvent } from "../events/EventSubChannelFollowEvent.mjs";
import { EventSubSubscription } from "./EventSubSubscription.mjs";
/** @internal */
let EventSubChannelFollowSubscription = class EventSubChannelFollowSubscription extends EventSubSubscription {
    constructor(handler, client, _userId, _moderatorId) {
        super(handler, client);
        this._userId = _userId;
        this._moderatorId = _moderatorId;
        /** @protected */ this._cliName = 'follow';
    }
    get id() {
        return `channel.follow.${this._userId}.${this._moderatorId}`;
    }
    get authUserId() {
        return this._moderatorId;
    }
    transformData(data) {
        return new EventSubChannelFollowEvent(data, this._client._apiClient);
    }
    async _subscribe() {
        return await this._client._apiClient.asUser(this._moderatorId, async (ctx) => await ctx.eventSub.subscribeToChannelFollowEvents(this._userId, await this._getTransportOptions()));
    }
};
EventSubChannelFollowSubscription = __decorate([
    rtfm('eventsub-base', 'EventSubSubscription')
], EventSubChannelFollowSubscription);
export { EventSubChannelFollowSubscription };
