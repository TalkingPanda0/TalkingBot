"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelShoutoutReceiveEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * An EventSub event representing a broadcaster being shouted out by another broadcaster.
 */
let EventSubChannelShoutoutReceiveEvent = class EventSubChannelShoutoutReceiveEvent extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster who received the shoutout.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster who received the shoutout.
     */
    get broadcasterName() {
        return this[common_1.rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster who received the shoutout.
     */
    get broadcasterDisplayName() {
        return this[common_1.rawDataSymbol].broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster who received the shoutout.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_user_id));
    }
    /**
     * The ID of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterId() {
        return this[common_1.rawDataSymbol].from_broadcaster_user_id;
    }
    /**
     * The name of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterName() {
        return this[common_1.rawDataSymbol].from_broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterDisplayName() {
        return this[common_1.rawDataSymbol].from_broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster who sent the shoutout.
     */
    async getShoutingOutBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].from_broadcaster_user_id));
    }
    /**
     * The amount of viewers who were watching the sending broadcaster's stream at the time of the shoutout.
     */
    get viewerCount() {
        return this[common_1.rawDataSymbol].viewer_count;
    }
    /**
     * The Date when the shoutout was sent.
     */
    get startDate() {
        return new Date(this[common_1.rawDataSymbol].started_at);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubChannelShoutoutReceiveEvent.prototype, "_client", void 0);
EventSubChannelShoutoutReceiveEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubChannelShoutoutReceiveEvent', 'shoutingOutBroadcasterId')
], EventSubChannelShoutoutReceiveEvent);
exports.EventSubChannelShoutoutReceiveEvent = EventSubChannelShoutoutReceiveEvent;
