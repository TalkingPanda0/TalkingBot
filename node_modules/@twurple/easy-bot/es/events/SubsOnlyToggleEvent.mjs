import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing subscriber-only mode being toggled in a channel.
 *
 * @meta category events
 */
let SubsOnlyToggleEvent = class SubsOnlyToggleEvent {
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
     * Whether subscriber-only mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * Enables subscriber-only mode in the channel.
     */
    async enable() {
        await this._bot.enableSubsOnly(this.broadcasterName);
    }
    /**
     * Disables subscriber-only mode in the channel.
     */
    async disable() {
        await this._bot.disableSubsOnly(this.broadcasterName);
    }
};
__decorate([
    Enumerable(false)
], SubsOnlyToggleEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], SubsOnlyToggleEvent.prototype, "_enabled", void 0);
__decorate([
    Enumerable(false)
], SubsOnlyToggleEvent.prototype, "_bot", void 0);
SubsOnlyToggleEvent = __decorate([
    rtfm('easy-bot', 'SubsOnlyToggleEvent', 'broadcasterName')
], SubsOnlyToggleEvent);
export { SubsOnlyToggleEvent };
