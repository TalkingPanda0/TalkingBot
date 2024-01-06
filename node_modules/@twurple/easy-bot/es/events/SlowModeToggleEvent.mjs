import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing slow mode being toggled in a channel.
 *
 * @meta category events
 */
let SlowModeToggleEvent = class SlowModeToggleEvent {
    /** @internal */
    constructor(channel, enabled, delay, bot) {
        this._broadcasterName = toUserName(channel);
        this._enabled = enabled;
        this._delay = delay;
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
     * Whether slow mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * The time (in seconds) a user has to wait after sending a message to send another one.
     */
    get delay() {
        var _a;
        return (_a = this._delay) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Enables slow mode in the channel.
     *
     * @param delay The time (in seconds) a user has to wait after sending a message to send another one.
     */
    async enable(delay = 30) {
        await this._bot.enableSlowMode(this.broadcasterName, delay);
    }
    /**
     * Disables slow mode in the channel.
     */
    async disable() {
        await this._bot.disableSlowMode(this.broadcasterName);
    }
};
__decorate([
    Enumerable(false)
], SlowModeToggleEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], SlowModeToggleEvent.prototype, "_enabled", void 0);
__decorate([
    Enumerable(false)
], SlowModeToggleEvent.prototype, "_delay", void 0);
__decorate([
    Enumerable(false)
], SlowModeToggleEvent.prototype, "_bot", void 0);
SlowModeToggleEvent = __decorate([
    rtfm('easy-bot', 'SlowModeToggleEvent', 'broadcasterName')
], SlowModeToggleEvent);
export { SlowModeToggleEvent };
