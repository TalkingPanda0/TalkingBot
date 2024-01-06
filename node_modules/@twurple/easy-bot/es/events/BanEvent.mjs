import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, HellFreezesOverError, rtfm } from '@twurple/common';
/**
 * An event representing a user getting banned from a channel.
 *
 * @meta category events
 */
let BanEvent = class BanEvent {
    /** @internal */
    constructor(channel, userName, duration, msg, bot) {
        this._broadcasterName = toUserName(channel);
        this._userName = userName;
        this._duration = duration;
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
     * The ID of the user who was banned.
     */
    get userId() {
        if (!this._msg.targetUserId) {
            throw new HellFreezesOverError('Ban event without target user received');
        }
        return this._msg.targetUserId;
    }
    /**
     * The name of the user who was banned.
     */
    get userName() {
        return this._userName;
    }
    /**
     * Gets more information about the user who was banned.
     */
    async getUser() {
        return checkRelationAssertion(await this._bot.api.users.getUserById(this.userId));
    }
    /**
     * The duration of the ban, or `null` if it's permanent.
     */
    get duration() {
        return this._duration;
    }
    /**
     * Remove the ban.
     */
    async unban() {
        await this._bot.unbanByIds(this.broadcasterId, this.userId);
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
], BanEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], BanEvent.prototype, "_userName", void 0);
__decorate([
    Enumerable(false)
], BanEvent.prototype, "_duration", void 0);
__decorate([
    Enumerable(false)
], BanEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], BanEvent.prototype, "_bot", void 0);
BanEvent = __decorate([
    rtfm('easy-bot', 'BanEvent', 'userId')
], BanEvent);
export { BanEvent };
