"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityPayForwardEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing a user gifting a subscription to the community of a channel in response to getting one gifted.
 *
 * @meta category events
 */
let CommunityPayForwardEvent = class CommunityPayForwardEvent {
    /** @internal */
    constructor(channel, userName, info, msg, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
        this._gifterName = userName;
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
     * The ID of the user who sent the new gift.
     */
    get gifterId() {
        return this._msg.userInfo.userId;
    }
    /**
     * The name of the user who sent the new gift.
     */
    get gifterName() {
        return this._gifterName;
    }
    /**
     * The display name of the user who sent the new gift.
     */
    get gifterDisplayName() {
        return this._info.displayName;
    }
    /**
     * Gets more information about the user who sent the new gift.
     */
    async getGifter() {
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserById(this.gifterId));
    }
    /**
     * The ID of the user who sent the original gift, or `null` if they were anonymous.
     */
    get originalGifterId() {
        var _a;
        return (_a = this._info.originalGifterUserId) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The display name of the user who sent the original gift, or `null` if they were anonymous.
     */
    get originalGifterDisplayName() {
        var _a;
        return (_a = this._info.originalGifterDisplayName) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets more information about the user who sent the original gift, or `null` if they were anonymous.
     */
    async getOriginalGifter() {
        const id = this.originalGifterId;
        if (!id) {
            return null;
        }
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserById(id));
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], CommunityPayForwardEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], CommunityPayForwardEvent.prototype, "_gifterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], CommunityPayForwardEvent.prototype, "_info", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], CommunityPayForwardEvent.prototype, "_msg", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], CommunityPayForwardEvent.prototype, "_bot", void 0);
CommunityPayForwardEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'CommunityPayForwardEvent', 'gifterId')
], CommunityPayForwardEvent);
exports.CommunityPayForwardEvent = CommunityPayForwardEvent;
