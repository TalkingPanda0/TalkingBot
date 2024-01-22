"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelRaidEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * An EventSub event representing a broadcaster raiding another broadcaster.
 */
let EventSubChannelRaidEvent = class EventSubChannelRaidEvent extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the raiding broadcaster.
     */
    get raidingBroadcasterId() {
        return this[common_1.rawDataSymbol].from_broadcaster_user_id;
    }
    /**
     * The name of the raiding broadcaster.
     */
    get raidingBroadcasterName() {
        return this[common_1.rawDataSymbol].from_broadcaster_user_login;
    }
    /**
     * The display name of the raiding broadcaster.
     */
    get raidingBroadcasterDisplayName() {
        return this[common_1.rawDataSymbol].from_broadcaster_user_name;
    }
    /**
     * Gets more information about the raiding broadcaster.
     */
    async getRaidingBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].from_broadcaster_user_id));
    }
    /**
     * The ID of the raided broadcaster.
     */
    get raidedBroadcasterId() {
        return this[common_1.rawDataSymbol].to_broadcaster_user_id;
    }
    /**
     * The name of the raided broadcaster.
     */
    get raidedBroadcasterName() {
        return this[common_1.rawDataSymbol].to_broadcaster_user_login;
    }
    /**
     * The display name of the raided broadcaster.
     */
    get raidedBroadcasterDisplayName() {
        return this[common_1.rawDataSymbol].to_broadcaster_user_name;
    }
    /**
     * Gets more information about the raided broadcaster.
     */
    async getRaidedBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].to_broadcaster_user_id));
    }
    /**
     * The amount of viewers in the raid.
     */
    get viewers() {
        return this[common_1.rawDataSymbol].viewers;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubChannelRaidEvent.prototype, "_client", void 0);
EventSubChannelRaidEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubChannelRaidEvent', 'raidedBroadcasterId')
], EventSubChannelRaidEvent);
exports.EventSubChannelRaidEvent = EventSubChannelRaidEvent;
