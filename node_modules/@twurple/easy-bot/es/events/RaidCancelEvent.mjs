import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing an outgoing raid being canceled.
 *
 * @meta category events
 */
let RaidCancelEvent = class RaidCancelEvent {
    /** @internal */
    constructor(channel, msg, bot) {
        this._broadcasterName = toUserName(channel);
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
     * The ID of the user who canceled the raid.
     */
    get userId() {
        return this._msg.userInfo.userId;
    }
    /**
     * The name of the user who canceled the raid.
     */
    get userName() {
        return this._msg.userInfo.userName;
    }
    /**
     * The display name of the user who canceled the raid.
     */
    get userDisplayName() {
        return this._msg.userInfo.displayName;
    }
    /**
     * Gets more information about the user who canceled the raid.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.userId));
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
], RaidCancelEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], RaidCancelEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], RaidCancelEvent.prototype, "_bot", void 0);
RaidCancelEvent = __decorate([
    rtfm('easy-bot', 'RaidCancelEvent', 'broadcasterName')
], RaidCancelEvent);
export { RaidCancelEvent };
