"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const ircv3_1 = require("ircv3");
const ChatUser_1 = require("../ChatUser");
const emoteUtil_1 = require("../utils/emoteUtil");
// yes, this is necessary. pls fix twitch
const HYPE_CHAT_LEVELS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
/**
 * A regular chat message.
 */
let ChatMessage = class ChatMessage extends ircv3_1.MessageTypes.Commands.PrivateMessage {
    /**
     * The ID of the message.
     */
    get id() {
        return this._tags.get('id');
    }
    /**
     * The date the message was sent at.
     */
    get date() {
        const timestamp = this._tags.get('tmi-sent-ts');
        return new Date(Number(timestamp));
    }
    /**
     * Info about the user that send the message, like their user ID and their status in the current channel.
     */
    get userInfo() {
        return new ChatUser_1.ChatUser(this._prefix.nick, this._tags);
    }
    /**
     * The ID of the channel the message is in.
     */
    get channelId() {
        var _a;
        return (_a = this._tags.get('room-id')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Whether the message is a cheer.
     */
    get isCheer() {
        return this._tags.has('bits');
    }
    /**
     * Whether the message represents a redemption of a custom channel points reward.
     */
    get isRedemption() {
        return Boolean(this._tags.get('custom-reward-id'));
    }
    /**
     * The ID of the redeemed reward, or `null` if the message does not represent a redemption.
     */
    get rewardId() {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return this._tags.get('custom-reward-id') || null;
    }
    /**
     * Whether the message is the first message of the chatter who sent it.
     */
    get isFirst() {
        return this._tags.get('first-msg') === '1';
    }
    /**
     * Whether the message is sent by a returning chatter.
     *
     * Twitch defines this as a new viewer who has chatted at least twice in the last 30 days.
     */
    get isReturningChatter() {
        return this._tags.get('returning-chatter') === '1';
    }
    /**
     * Whether the message is highlighted by using channel points.
     */
    get isHighlight() {
        return this._tags.get('msg-id') === 'highlighted-message';
    }
    /**
     * Whether the message is a reply to another message.
     */
    get isReply() {
        return this._tags.has('reply-parent-msg-id');
    }
    /**
     * The ID of the message that this message is a reply to, or `null` if it's not a reply.
     */
    get parentMessageId() {
        var _a;
        return (_a = this._tags.get('reply-parent-msg-id')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The text of the message that this message is a reply to, or `null` if it's not a reply.
     */
    get parentMessageText() {
        var _a;
        return (_a = this._tags.get('reply-parent-msg-body')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The ID of the user that wrote the message that this message is a reply to, or `null` if it's not a reply.
     */
    get parentMessageUserId() {
        var _a;
        return (_a = this._tags.get('reply-parent-user-id')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The name of the user that wrote the message that this message is a reply to, or `null` if it's not a reply.
     */
    get parentMessageUserName() {
        var _a;
        return (_a = this._tags.get('reply-parent-user-login')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The display name of the user that wrote the message that this message is a reply to, or `null` if it's not a reply.
     */
    get parentMessageUserDisplayName() {
        var _a;
        return (_a = this._tags.get('reply-parent-display-name')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The ID of the message that is the thread starter of this message, or `null` if it's not a reply.
     */
    get threadMessageId() {
        var _a;
        return (_a = this._tags.get('reply-thread-parent-msg-id')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The ID of the user that wrote the thread starter message of this message, or `null` if it's not a reply.
     */
    get threadMessageUserId() {
        var _a;
        return (_a = this._tags.get('reply-thread-parent-user-id')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The number of bits cheered with the message.
     */
    get bits() {
        var _a;
        return Number((_a = this._tags.get('bits')) !== null && _a !== void 0 ? _a : 0);
    }
    /**
     * The offsets of emote usages in the message.
     */
    get emoteOffsets() {
        return (0, emoteUtil_1.parseEmoteOffsets)(this._tags.get('emotes'));
    }
    /**
     * Whether the message is a Hype Chat.
     */
    get isHypeChat() {
        return this._tags.has('pinned-chat-paid-amount');
    }
    /**
     * The amount of money that was sent for Hype Chat, specified in the currency’s minor unit,
     * or `null` if the message is not a Hype Chat.
     *
     * For example, the minor units for USD is cents, so if the amount is $5.50 USD, `value` is set to 550.
     */
    get hypeChatAmount() {
        return (0, shared_utils_1.mapNullable)(this._tags.get('pinned-chat-paid-amount'), Number);
    }
    /**
     * The number of decimal places used by the currency used for Hype Chat,
     * or `null` if the message is not a Hype Chat.
     *
     * For example, USD uses two decimal places.
     * Use this number to translate `hypeChatAmount` from minor units to major units by using the formula:
     *
     * `value / 10^decimalPlaces`
     */
    get hypeChatDecimalPlaces() {
        return (0, shared_utils_1.mapNullable)(this._tags.get('pinned-chat-paid-exponent'), Number);
    }
    /**
     * The localized amount of money sent for Hype Chat, based on the value and the decimal places of the currency,
     * or `null` if the message is not a Hype Chat.
     *
     * For example, the minor units for USD is cents which uses two decimal places,
     * so if `value` is 550, `localizedValue` is set to 5.50.
     */
    get hypeChatLocalizedAmount() {
        const amount = this.hypeChatAmount;
        if (!amount) {
            return null;
        }
        return amount / 10 ** this.hypeChatDecimalPlaces;
    }
    /**
     * The ISO-4217 three-letter currency code that identifies the currency used for Hype Chat,
     * or `null` if the message is not a Hype Chat.
     */
    get hypeChatCurrency() {
        var _a;
        return (_a = this._tags.get('pinned-chat-paid-currency')) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * The level of the Hype Chat, or `null` if the message is not a Hype Chat.
     */
    get hypeChatLevel() {
        const levelString = this._tags.get('pinned-chat-paid-level');
        if (!levelString) {
            return null;
        }
        return HYPE_CHAT_LEVELS.indexOf(levelString) + 1;
    }
    /**
     * Whether the system filled in the message for the Hype Chat (because the user didn't type one),
     * or `null` if the message is not a Hype Chat.
     */
    get hypeChatIsSystemMessage() {
        const flagString = this._tags.get('pinned-chat-paid-is-system-message');
        if (!flagString) {
            return null;
        }
        return Boolean(Number(flagString));
    }
};
ChatMessage = tslib_1.__decorate([
    (0, common_1.rtfm)('chat', 'ChatMessage', 'id')
], ChatMessage);
exports.ChatMessage = ChatMessage;
