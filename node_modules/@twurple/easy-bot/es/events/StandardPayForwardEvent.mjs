import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing a user gifting a subscription to a specific user in a channel
 * in response to getting one gifted.
 *
 * @meta category events
 */
let StandardPayForwardEvent = class StandardPayForwardEvent {
    /** @internal */
    constructor(channel, userName, info, msg, bot) {
        this._broadcasterName = toUserName(channel);
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
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.broadcasterId));
    }
    /**
     * The ID of the recipient of the gift.
     */
    get userId() {
        return this._info.recipientUserId;
    }
    /**
     * The display name of the recipient of the gift.
     */
    get userDisplayName() {
        return this._info.recipientDisplayName;
    }
    /**
     * Gets more information about the recipient of the gift.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.userId));
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
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.gifterId));
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
        return checkRelationAssertion(await this._bot.api.users.getUserById(id));
    }
    /**
     * The full object that contains all the message information.
     */
    get messageObject() {
        return this._msg;
    }
};
__decorate([
    Enumerable(false)
], StandardPayForwardEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], StandardPayForwardEvent.prototype, "_gifterName", void 0);
__decorate([
    Enumerable(false)
], StandardPayForwardEvent.prototype, "_info", void 0);
__decorate([
    Enumerable(false)
], StandardPayForwardEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], StandardPayForwardEvent.prototype, "_bot", void 0);
StandardPayForwardEvent = __decorate([
    rtfm('easy-bot', 'StandardPayForwardEvent', 'gifterId')
], StandardPayForwardEvent);
export { StandardPayForwardEvent };
