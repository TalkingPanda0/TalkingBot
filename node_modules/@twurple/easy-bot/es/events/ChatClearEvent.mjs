import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing the chat of a channel getting cleared.
 *
 * @meta category events
 */
let ChatClearEvent = class ChatClearEvent {
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
     * The full object that contains all the message information.
     */
    get messageObject() {
        return this._msg;
    }
};
__decorate([
    Enumerable(false)
], ChatClearEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], ChatClearEvent.prototype, "_msg", void 0);
__decorate([
    Enumerable(false)
], ChatClearEvent.prototype, "_bot", void 0);
ChatClearEvent = __decorate([
    rtfm('easy-bot', 'ChatClearEvent', 'broadcasterId')
], ChatClearEvent);
export { ChatClearEvent };
