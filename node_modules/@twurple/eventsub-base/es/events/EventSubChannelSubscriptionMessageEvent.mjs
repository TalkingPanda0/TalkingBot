import { __decorate } from "tslib";
import { Enumerable, groupBy } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing the public announcement of a channel subscription by the subscriber.
 */
let EventSubChannelSubscriptionMessageEvent = class EventSubChannelSubscriptionMessageEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the user whose subscription is being announced.
     */
    get userId() {
        return this[rawDataSymbol].user_id;
    }
    /**
     * The name of the user whose subscription is being announced.
     */
    get userName() {
        return this[rawDataSymbol].user_login;
    }
    /**
     * The display name of the user whose subscription is being announced.
     */
    get userDisplayName() {
        return this[rawDataSymbol].user_name;
    }
    /**
     * Gets more information about the user whose subscription is being announced.
     */
    async getUser() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].user_id));
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
     * The tier of the subscription, either 1000, 2000 or 3000.
     */
    get tier() {
        return this[rawDataSymbol].tier;
    }
    /**
     * The total number of months the user has been subscribed.
     */
    get cumulativeMonths() {
        return this[rawDataSymbol].cumulative_months;
    }
    /**
     * The number of months the user has been subscribed in a row, or null if they don't want to share it.
     */
    get streakMonths() {
        return this[rawDataSymbol].streak_months;
    }
    /**
     * The number of months the user has now subscribed.
     */
    get durationMonths() {
        return this[rawDataSymbol].duration_months;
    }
    /**
     * The text of the message.
     */
    get messageText() {
        return this[rawDataSymbol].message.text;
    }
    /**
     * The offsets of emote usages in the message.
     */
    get emoteOffsets() {
        var _a;
        return new Map(Object.entries(groupBy((_a = this[rawDataSymbol].message.emotes) !== null && _a !== void 0 ? _a : [], 'id')).map(([id, ranges]) => [
            id,
            ranges.map(({ begin, end }) => `${begin}-${end}`),
        ]));
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelSubscriptionMessageEvent.prototype, "_client", void 0);
EventSubChannelSubscriptionMessageEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelSubscriptionMessageEvent', 'userId')
], EventSubChannelSubscriptionMessageEvent);
export { EventSubChannelSubscriptionMessageEvent };
