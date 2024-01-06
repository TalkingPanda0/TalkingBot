"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitsBadgeUpgradeEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing a user unlocking a new bits badge in a channel.
 *
 * @meta category events
 */
let BitsBadgeUpgradeEvent = class BitsBadgeUpgradeEvent {
    /** @internal */
    constructor(channel, userName, info, msg, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
        this._userName = userName;
        this._info = info;
        this._msg = msg;
        this._bot = bot;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this._msg.channelId;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this._broadcasterName;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserById(this.broadcasterId));
    }
    /**
     * The ID of the user who unlocked the badge.
     */
    get userId() {
        return this._msg.userInfo.userId;
    }
    /**
     * The name of the user who unlocked the badge.
     */
    get userName() {
        return this._userName;
    }
    /**
     * The display name of the user who unlocked the badge.
     */
    get userDisplayName() {
        return this._info.displayName;
    }
    /**
     * Gets more information about the user who unlocked the badge.
     */
    async getUser() {
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserById(this.userId));
    }
    /**
     * The bits threshold that was reached.
     */
    get threshold() {
        return this._info.threshold;
    }
    /**
     * The full object that contains all the message information.
     */
    get messageObject() {
        return this._msg;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], BitsBadgeUpgradeEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], BitsBadgeUpgradeEvent.prototype, "_userName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], BitsBadgeUpgradeEvent.prototype, "_info", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], BitsBadgeUpgradeEvent.prototype, "_msg", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], BitsBadgeUpgradeEvent.prototype, "_bot", void 0);
BitsBadgeUpgradeEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'BitsBadgeUpgradeEvent', 'userId')
], BitsBadgeUpgradeEvent);
exports.BitsBadgeUpgradeEvent = BitsBadgeUpgradeEvent;
