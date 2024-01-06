import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing a user gifting subscriptions to the community of a channel.
 *
 * @meta category events
 */
let CommunitySubEvent = class CommunitySubEvent {
    /** @internal */
    constructor(channel, info, msg, bot) {
        this._broadcasterName = toUserName(channel);
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
     * The ID of the user who sent the gift.
     */
    get gifterId() {
        var _a;
        return (_a = this._info.gifterUserId) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The name of the user who sent the gift.
     */
    get gifterName() {
        var _a;
        return (_a = this._info.gifter) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The display name of the user who sent the gift.
     */
    get gifterDisplayName() {
        var _a;
        return (_a = this._info.gifterDisplayName) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets more information about the user who sent the gift.
     */
    async getGifter() {
        const id = this.gifterId;
        if (!id) {
            return null;
        }
        return checkRelationAssertion(await this._bot.api.users.getUserById(id));
    }
    /**
     * The plan of the gifted subscription.
     */
    get plan() {
        return this._info.plan;
    }
    /**
     * The number of subscriptions that were gifted.
     */
    get count() {
        return this._info.count;
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
], CommunitySubEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], CommunitySubEvent.prototype, "_info", void 0);
__decorate([
    Enumerable(false)
], CommunitySubEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], CommunitySubEvent.prototype, "_bot", void 0);
CommunitySubEvent = __decorate([
    rtfm('easy-bot', 'CommunitySubEvent', 'gifterId')
], CommunitySubEvent);
export { CommunitySubEvent };
