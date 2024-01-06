import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { toUserName } from '@twurple/chat';
import { checkRelationAssertion, rtfm } from '@twurple/common';
/**
 * An event representing followers-only mode being toggled in a channel.
 *
 * @meta category events
 */
let FollowersOnlyToggleEvent = class FollowersOnlyToggleEvent {
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
     * Whether followers-only mode was enabled.
     *
     * `true` means it was enabled, `false` means it was disabled.
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * The time (in minutes) a user needs to follow the channel in order to be able to send messages in its chat.
     *
     * There needs to be a distinction between the values `0` (a user can chat immediately after following)
     * and `null` (followers-only mode was disabled).
     */
    get delay() {
        var _a;
        return (_a = this._delay) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Enables followers-only mode in the channel.
     *
     * @param delay The time (in minutes) a user needs to follow the channel in order to be able to send messages.
     */
    async enable(delay = 0) {
        await this._bot.enableFollowersOnly(this.broadcasterName, delay);
    }
    /**
     * Disables followers-only mode in the channel.
     */
    async disable() {
        await this._bot.disableFollowersOnly(this.broadcasterName);
    }
};
__decorate([
    Enumerable(false)
], FollowersOnlyToggleEvent.prototype, "_broadcasterName", void 0);
__decorate([
    Enumerable(false)
], FollowersOnlyToggleEvent.prototype, "_enabled", void 0);
__decorate([
    Enumerable(false)
], FollowersOnlyToggleEvent.prototype, "_delay", void 0);
__decorate([
    Enumerable(false)
], FollowersOnlyToggleEvent.prototype, "_bot", void 0);
FollowersOnlyToggleEvent = __decorate([
    rtfm('easy-bot', 'FollowersOnlyToggleEvent', 'broadcasterName')
], FollowersOnlyToggleEvent);
export { FollowersOnlyToggleEvent };
