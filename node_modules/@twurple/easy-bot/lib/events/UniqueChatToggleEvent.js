"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueChatToggleEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const chat_1 = require("@twurple/chat");
const common_1 = require("@twurple/common");
/**
 * An event representing unique chat mode being toggled in a channel.
 *
 * @meta category events
 */
let UniqueChatToggleEvent = class UniqueChatToggleEvent {
    /** @internal */
    constructor(channel, enabled, bot) {
        this._broadcasterName = (0, chat_1.toUserName)(channel);
        this._enabled = enabled;
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
     * Whether unique chat mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * Enables unique chat mode in the channel.
     */
    async enable() {
        await this._bot.enableUniqueChat(this.broadcasterName);
    }
    /**
     * Disables unique chat mode in the channel.
     */
    async disable() {
        await this._bot.disableUniqueChat(this.broadcasterName);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], UniqueChatToggleEvent.prototype, "_broadcasterName", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], UniqueChatToggleEvent.prototype, "_enabled", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], UniqueChatToggleEvent.prototype, "_bot", void 0);
UniqueChatToggleEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('easy-bot', 'UniqueChatToggleEvent', 'broadcasterName')
], UniqueChatToggleEvent);
exports.UniqueChatToggleEvent = UniqueChatToggleEvent;
