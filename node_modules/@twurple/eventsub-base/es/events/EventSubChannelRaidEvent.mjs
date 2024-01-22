import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a broadcaster raiding another broadcaster.
 */
let EventSubChannelRaidEvent = class EventSubChannelRaidEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the raiding broadcaster.
     */
    get raidingBroadcasterId() {
        return this[rawDataSymbol].from_broadcaster_user_id;
    }
    /**
     * The name of the raiding broadcaster.
     */
    get raidingBroadcasterName() {
        return this[rawDataSymbol].from_broadcaster_user_login;
    }
    /**
     * The display name of the raiding broadcaster.
     */
    get raidingBroadcasterDisplayName() {
        return this[rawDataSymbol].from_broadcaster_user_name;
    }
    /**
     * Gets more information about the raiding broadcaster.
     */
    async getRaidingBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].from_broadcaster_user_id));
    }
    /**
     * The ID of the raided broadcaster.
     */
    get raidedBroadcasterId() {
        return this[rawDataSymbol].to_broadcaster_user_id;
    }
    /**
     * The name of the raided broadcaster.
     */
    get raidedBroadcasterName() {
        return this[rawDataSymbol].to_broadcaster_user_login;
    }
    /**
     * The display name of the raided broadcaster.
     */
    get raidedBroadcasterDisplayName() {
        return this[rawDataSymbol].to_broadcaster_user_name;
    }
    /**
     * Gets more information about the raided broadcaster.
     */
    async getRaidedBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].to_broadcaster_user_id));
    }
    /**
     * The amount of viewers in the raid.
     */
    get viewers() {
        return this[rawDataSymbol].viewers;
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelRaidEvent.prototype, "_client", void 0);
EventSubChannelRaidEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelRaidEvent', 'raidedBroadcasterId')
], EventSubChannelRaidEvent);
export { EventSubChannelRaidEvent };
