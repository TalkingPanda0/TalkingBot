import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing unique chat mode being toggled in a channel.
 *
 * @meta category events
 */
let UniqueChatToggleEvent = class UniqueChatToggleEvent {
    /** @internal */
    constructor(channel, enabled, bot) {
        this._broadcasterName = toUserName(channel);
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
        return checkRelationAssertion(await this._bot.api.users.getUserByName(this.broadcasterName));
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
__decorate([
    Enumerable(false)
], UniqueChatToggleEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], UniqueChatToggleEvent.prototype, "_enabled", void 0);
__decorate([
    Enumerable(false)
], UniqueChatToggleEvent.prototype, "_bot", void 0);
UniqueChatToggleEvent = __decorate([
    rtfm('easy-bot', 'UniqueChatToggleEvent', 'broadcasterName')
], UniqueChatToggleEvent);
export { UniqueChatToggleEvent };
