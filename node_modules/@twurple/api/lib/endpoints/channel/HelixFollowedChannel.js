"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixFollowedChannel = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * Represents a broadcaster that a user follows.
 */
let HelixFollowedChannel = class HelixFollowedChannel extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this[common_1.rawDataSymbol].broadcaster_login;
    }
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName() {
        return this[common_1.rawDataSymbol].broadcaster_name;
    }
    /**
     * Gets additional information about the broadcaster.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_id));
    }
    /**
     * The date when the user followed the broadcaster.
     */
    get followDate() {
        return new Date(this[common_1.rawDataSymbol].followed_at);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixFollowedChannel.prototype, "_client", void 0);
HelixFollowedChannel = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixFollowedChannel', 'broadcasterId')
], HelixFollowedChannel);
exports.HelixFollowedChannel = HelixFollowedChannel;
