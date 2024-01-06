"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing a user sending a message to a channel's chat.
 *
 * @meta category events
 */
let MessageEvent = class MessageEvent {
    /** @internal */
    constructor(channel, userName, text, isAction, msg, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
        this._userName = userName;
        this._text = text;
        this._isAction = isAction;
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
     * The ID of the user who sent the message.
     */
    get userId() {
        return this._msg.userInfo.userId;
    }
    /**
     * The name of the user who sent the message.
     */
    get userName() {
        return this._userName;
    }
    /**
     * The display name of the user who sent the message.
     */
    get userDisplayName() {
        return this._msg.userInfo.displayName;
    }
    /**
     * Gets more information about the user who sent the message.
     */
    async getUser() {
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserById(this.userId));
    }
    /**
     * The text that was sent.
     */
    get text() {
        return this._text;
    }
    /**
     * Whether the message is formatted as an action (sent using the /me chat command).
     */
    get isAction() {
        return this._isAction;
    }
    /**
     * The offsets of the emotes contained in the message.
     */
    get emoteOffsets() {
        return this._msg.emoteOffsets;
    }
    /**
     * Replies to the message.
     *
     * @param text The text to send as a reply.
     */
    async reply(text) {
        await this._bot.reply(this.broadcasterName, text, this._msg);
    }
    /**
     * Deletes the message.
     */
    async delete() {
        await this._bot.deleteMessageById(this.broadcasterId, this._msg);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageEvent.prototype, "_userName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageEvent.prototype, "_text", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageEvent.prototype, "_isAction", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageEvent.prototype, "_msg", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], MessageEvent.prototype, "_bot", void 0);
MessageEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'MessageEvent', 'userId')
], MessageEvent);
exports.MessageEvent = MessageEvent;
