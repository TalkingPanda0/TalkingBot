import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
import { EventSubChannelHypeTrainContribution } from "./common/EventSubChannelHypeTrainContribution.mjs";
/**
 * An EventSub event representing the end of a Hype train event.
 */
let EventSubChannelHypeTrainEndEvent = class EventSubChannelHypeTrainEndEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the Hype Train.
     */
    get id() {
        return this[rawDataSymbol].id;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster.
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
     * The level the Hype Train ended on.
     */
    get level() {
        return this[rawDataSymbol].level;
    }
    /**
     * The total points contributed to the Hype Train.
     */
    get total() {
        return this[rawDataSymbol].total;
    }
    /**
     * The contributors with the most points, for both bits and subscriptions.
     */
    get topContributors() {
        var _a, _b;
        return ((_b = (_a = this[rawDataSymbol].top_contributions) === null || _a === void 0 ? void 0 : _a.map(data => new EventSubChannelHypeTrainContribution(data, this._client))) !== null && _b !== void 0 ? _b : []);
    }
    /**
     * The time when the Hype Train started.
     */
    get startDate() {
        return new Date(this[rawDataSymbol].started_at);
    }
    /**
     * The time when the Hype Train ended.
     */
    get endDate() {
        return new Date(this[rawDataSymbol].ended_at);
    }
    /**
     * The time when the Hype Train cooldown ends.
     */
    get cooldownEndDate() {
        return new Date(this[rawDataSymbol].cooldown_ends_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelHypeTrainEndEvent.prototype, "_client", void 0);
EventSubChannelHypeTrainEndEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelHypeTrainEndEvent', 'broadcasterId')
], EventSubChannelHypeTrainEndEvent);
export { EventSubChannelHypeTrainEndEvent };
