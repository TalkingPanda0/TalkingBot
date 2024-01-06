import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing the bot failing to join a channel.
 *
 * @meta category events
 */
let JoinFailureEvent = class JoinFailureEvent {
    /** @internal */
    constructor(channel, reason, bot) {
        this._broadcasterName = toUserName(channel);
        this._reason = reason;
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
     * The reason why the join failed.
     */
    get reason() {
        return this._reason;
    }
    /**
     * Tries to join again.
     */
    async retry() {
        await this._bot.join(this.broadcasterName);
    }
};
__decorate([
    Enumerable(false)
], JoinFailureEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], JoinFailureEvent.prototype, "_reason", void 0);
__decorate([
    Enumerable(false)
], JoinFailureEvent.prototype, "_bot", void 0);
JoinFailureEvent = __decorate([
    rtfm('easy-bot', 'JoinFailureEvent', 'broadcasterName')
], JoinFailureEvent);
export { JoinFailureEvent };
