"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRemoveEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing a message being removed from a channel's chat.
 *
 * @meta category events
 */
let MessageRemoveEvent = class MessageRemoveEvent {
    /** @internal */
    constructor(channel, messageId, msg, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
        this._messageId = messageId;
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
     * The name of the user who originally sent the message.
     */
    get userName() {
        return this._msg.userName;
    }
    /**
     * The ID of the deleted message.
     */
    get messageId() {
        return this._messageId;
    }
    /**
     * The text of the deleted message.
     */
    get originalText() {
        return this._msg.text;
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
], MessageRemoveEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageRemoveEvent.prototype, "_messageId", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageRemoveEvent.prototype, "_msg", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageRemoveEvent.prototype, "_bot", void 0);
MessageRemoveEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'MessageRemoveEvent', 'broadcasterName')
], MessageRemoveEvent);
exports.MessageRemoveEvent = MessageRemoveEvent;
