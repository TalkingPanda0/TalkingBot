import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing a gifted subscription being replaced by a paid one.
 *
 * @meta category events
 */
let GiftPaidUpgradeEvent = class GiftPaidUpgradeEvent {
    /** @internal */
    constructor(channel, userName, info, msg, bot) {
        this._broadcasterName = toUserName(channel);
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
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.broadcasterId));
    }
    /**
     * The ID of the user who paid for their subscription.
     */
    get userId() {
        return this._info.userId;
    }
    /**
     * The name of the user who paid for their subscription.
     */
    get userName() {
        return this._userName;
    }
    /**
     * The display name of the user who paid for their subscription.
     */
    get userDisplayName() {
        return this._info.displayName;
    }
    /**
     * Gets more information about the user who paid for their subscription.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.userId));
    }
    // TODO: might have anon gifts?
    /**
     * The name of the user who sent the original gift.
     */
    get gifterName() {
        return this._info.gifter;
    }
    /**
     * The display name of the user who sent the original gift.
     */
    get gifterDisplayName() {
        return this._info.gifterDisplayName;
    }
    /**
     * Gets more information about the user who sent the original gift.
     */
    async getGifter() {
        return checkRelationAssertion(await this._bot.api.users.getUserByName(this.gifterName));
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
], GiftPaidUpgradeEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], GiftPaidUpgradeEvent.prototype, "_userName", void 0);
__decorate([
    Enumerable(false)
], GiftPaidUpgradeEvent.prototype, "_info", void 0);
__decorate([
    Enumerable(false)
], GiftPaidUpgradeEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], GiftPaidUpgradeEvent.prototype, "_bot", void 0);
GiftPaidUpgradeEvent = __decorate([
    rtfm('easy-bot', 'GiftPaidUpgradeEvent', 'userId')
], GiftPaidUpgradeEvent);
export { GiftPaidUpgradeEvent };
