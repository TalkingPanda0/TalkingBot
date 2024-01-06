"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatClearEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing the chat of a channel getting cleared.
 *
 * @meta category events
 */
let ChatClearEvent = class ChatClearEvent {
    /** @internal */
    constructor(channel, msg, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
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
     * The full object that contains all the message information.
     */
    get messageObject() {
        return this._msg;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], ChatClearEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], ChatClearEvent.prototype, "_msg", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], ChatClearEvent.prototype, "_bot", void 0);
ChatClearEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'ChatClearEvent', 'broadcasterId')
], ChatClearEvent);
exports.ChatClearEvent = ChatClearEvent;
