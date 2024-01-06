"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinFailureEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing the bot failing to join a channel.
 *
 * @meta category events
 */
let JoinFailureEvent = class JoinFailureEvent {
    /** @internal */
    constructor(channel, reason, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
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
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserByName(this.broadcasterName));
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
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], JoinFailureEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], JoinFailureEvent.prototype, "_reason", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], JoinFailureEvent.prototype, "_bot", void 0);
JoinFailureEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'JoinFailureEvent', 'broadcasterName')
], JoinFailureEvent);
exports.JoinFailureEvent = JoinFailureEvent;
