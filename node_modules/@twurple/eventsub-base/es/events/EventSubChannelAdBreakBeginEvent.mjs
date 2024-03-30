import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing an ad break beginning in a broadcaster channel.
 */
let EventSubChannelAdBreakBeginEvent = class EventSubChannelAdBreakBeginEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The broadcaster's user ID for the channel the ad was run on.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The broadcaster's user login for the channel the ad was run on.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The broadcaster's user display name for the channel the ad was run on.
     */
    get broadcasterDisplayName() {
        return this[rawDataSymbol].broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].broadcaster_user_id));
    }
    /**
     * The ID of the user that requested the ad. For automatic ads, this will be the ID of the broadcaster.
     */
    get requesterId() {
        return this[rawDataSymbol].requester_user_id;
    }
    /**
     * The login of the user that requested the ad.
     */
    get requesterName() {
        return this[rawDataSymbol].requester_user_login;
    }
    /**
     * The display name of the user that requested the ad.
     */
    get requesterDisplayName() {
        return this[rawDataSymbol].requester_user_name;
    }
    /**
     * Gets more information about the user that requested the ad.
     */
    async getRequester() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].requester_user_id));
    }
    /**
     * Length in seconds of the mid-roll ad break requested.
     */
    get durationSeconds() {
        return this[rawDataSymbol].duration_seconds;
    }
    /**
     * The date/time when the ad break started.
     */
    get startDate() {
        return new Date(this[rawDataSymbol].started_at);
    }
    /**
     * Indicates if the ad was automatically scheduled via Ads Manager.
     */
    get isAutomatic() {
        return this[rawDataSymbol].is_automatic;
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelAdBreakBeginEvent.prototype, "_client", void 0);
EventSubChannelAdBreakBeginEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelAdBreakBeginEvent', 'broadcasterId')
], EventSubChannelAdBreakBeginEvent);
export { EventSubChannelAdBreakBeginEvent };
