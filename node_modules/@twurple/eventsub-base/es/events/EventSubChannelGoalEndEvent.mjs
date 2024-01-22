import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a creator goal starting in a channel.
 */
let EventSubChannelGoalEndEvent = class EventSubChannelGoalEndEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the goal.
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
     * The type of the goal. Can be either "follower" or "subscription".
     */
    get type() {
        return this[rawDataSymbol].type;
    }
    /**
     * The description of the goal.
     */
    get description() {
        return this[rawDataSymbol].description;
    }
    /**
     * Whether the goal has been achieved or not.
     */
    get isAchieved() {
        return this[rawDataSymbol].is_achieved;
    }
    /**
     * The current value of the goal.
     */
    get currentAmount() {
        return this[rawDataSymbol].current_amount;
    }
    /**
     * The target value of the goal.
     */
    get targetAmount() {
        return this[rawDataSymbol].target_amount;
    }
    /**
     * The time when the goal started.
     */
    get startDate() {
        return new Date(this[rawDataSymbol].started_at);
    }
    /**
     * The time when the goal ended.
     */
    get endDate() {
        return new Date(this[rawDataSymbol].ended_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelGoalEndEvent.prototype, "_client", void 0);
EventSubChannelGoalEndEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelGoalEndEvent', 'broadcasterId')
], EventSubChannelGoalEndEvent);
export { EventSubChannelGoalEndEvent };
