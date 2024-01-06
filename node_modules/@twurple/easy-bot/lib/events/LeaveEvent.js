"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing a user leaving a channel.
 *
 * The join/leave events are cached by the Twitch chat server and will be batched and sent every 30-60 seconds.
 *
 * Please note that if you have not enabled the `requestMembershipEvents` option
 * or the channel has more than 1000 connected chatters, this will only react to your own joins.
 *
 * @meta category events
 */
let LeaveEvent = class LeaveEvent {
    /** @internal */
    constructor(channel, userName, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
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
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserByName(this.broadcasterName));
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
        return (0, common_1.checkRelationAssertion)(await this._bot.api.users.getUserByName(this.userName));
    }
    /**
     * Joins the channel again.
     */
    async join() {
        await this._bot.join(this.broadcasterName);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], LeaveEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], LeaveEvent.prototype, "_userName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], LeaveEvent.prototype, "_bot", void 0);
LeaveEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'LeaveEvent', 'broadcasterName')
], LeaveEvent);
exports.LeaveEvent = LeaveEvent;
