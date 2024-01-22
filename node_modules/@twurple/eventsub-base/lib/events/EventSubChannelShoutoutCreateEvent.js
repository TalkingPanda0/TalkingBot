"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelShoutoutCreateEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * An EventSub event representing a broadcaster shouting out another broadcaster.
 */
let EventSubChannelShoutoutCreateEvent = class EventSubChannelShoutoutCreateEvent extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterName() {
        return this[common_1.rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterDisplayName() {
        return this[common_1.rawDataSymbol].broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster from whose channel the shoutout was sent.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_user_id));
    }
    /**
     * The ID of the moderator who sent the shoutout.
     */
    get moderatorId() {
        return this[common_1.rawDataSymbol].moderator_user_id;
    }
    /**
     * The name of the moderator who sent the shoutout.
     */
    get moderatorName() {
        return this[common_1.rawDataSymbol].moderator_user_login;
    }
    /**
     * The display name of the moderator who sent the shoutout.
     */
    get moderatorDisplayName() {
        return this[common_1.rawDataSymbol].moderator_user_name;
    }
    /**
     * Gets more information about the moderator who sent the shoutout.
     */
    async getModerator() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].moderator_user_id));
    }
    /**
     * The ID of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterId() {
        return this[common_1.rawDataSymbol].to_broadcaster_user_id;
    }
    /**
     * The name of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterName() {
        return this[common_1.rawDataSymbol].to_broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterDisplayName() {
        return this[common_1.rawDataSymbol].to_broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster who was shoutout out.
     */
    async getShoutedOutBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].to_broadcaster_user_id));
    }
    /**
     * The amount of viewers who were watching the sending broadcaster's stream at the time they sent the shoutout.
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
    /**
     * The Date when the broadcaster may send a shoutout to a different broadcaster.
     */
    get cooldownEndDate() {
        return new Date(this[common_1.rawDataSymbol].cooldown_ends_at);
    }
    /**
     * The Date when the broadcaster may send another shoutout to the same broadcaster.
     */
    get targetCooldownEndDate() {
        return new Date(this[common_1.rawDataSymbol].target_cooldown_ends_at);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubChannelShoutoutCreateEvent.prototype, "_client", void 0);
EventSubChannelShoutoutCreateEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubChannelShoutoutCreateEvent', 'shoutedOutBroadcasterId')
], EventSubChannelShoutoutCreateEvent);
exports.EventSubChannelShoutoutCreateEvent = EventSubChannelShoutoutCreateEvent;
