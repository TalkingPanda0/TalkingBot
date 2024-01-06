import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing a user joining a channel.
 *
 * The join/leave events are cached by the Twitch chat server and will be batched and sent every 30-60 seconds.
 *
 * Please note that if you have not enabled the `requestMembershipEvents` option
 * or the channel has more than 1000 connected chatters, this will only react to your own joins.
 *
 * @meta category events
 */
let JoinEvent = class JoinEvent {
    /** @internal */
    constructor(channel, userName, bot) {
        this._broadcasterName = toUserName(channel);
        this._userName = userName;
        this._bot = bot;
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
        return checkRelationAssertion(await this._bot.api.users.getUserByName(this.broadcasterName));
    }
    /**
     * The name of the user.
     */
    get userName() {
        return this._userName;
    }
    /**
     * Gets more information about the user.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserByName(this.userName));
    }
    /**
     * Leaves the channel.
     */
    leave() {
        this._bot.leave(this.broadcasterName);
    }
};
__decorate([
    Enumerable(false)
], JoinEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], JoinEvent.prototype, "_userName", void 0);
__decorate([
    Enumerable(false)
], JoinEvent.prototype, "_bot", void 0);
JoinEvent = __decorate([
    rtfm('easy-bot', 'JoinEvent', 'broadcasterName')
], JoinEvent);
export { JoinEvent };
