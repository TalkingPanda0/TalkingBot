"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixChatSettings = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * The settings of a broadcaster's chat.
 */
let HelixChatSettings = class HelixChatSettings extends common_1.DataObject {
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * Whether slow mode is enabled.
     */
    get slowModeEnabled() {
        return this[common_1.rawDataSymbol].slow_mode;
    }
    /**
     * The time to wait between messages in slow mode, in seconds.
     *
     * Is `null` if slow mode is not enabled.
     */
    get slowModeDelay() {
        return this[common_1.rawDataSymbol].slow_mode_wait_time;
    }
    /**
     * Whether follower only mode is enabled.
     */
    get followerOnlyModeEnabled() {
        return this[common_1.rawDataSymbol].follower_mode;
    }
    /**
     * The time after which users are able to send messages after following, in minutes.
     *
     * Is `null` if follower only mode is not enabled,
     * but may also be `0` if you can send messages immediately after following.
     */
    get followerOnlyModeDelay() {
        return this[common_1.rawDataSymbol].follower_mode_duration;
    }
    /**
     * Whether subscriber only mode is enabled.
     */
    get subscriberOnlyModeEnabled() {
        return this[common_1.rawDataSymbol].subscriber_mode;
    }
    /**
     * Whether emote only mode is enabled.
     */
    get emoteOnlyModeEnabled() {
        return this[common_1.rawDataSymbol].emote_mode;
    }
    /**
     * Whether unique chat mode is enabled.
     */
    get uniqueChatModeEnabled() {
        return this[common_1.rawDataSymbol].unique_chat_mode;
    }
};
HelixChatSettings = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixChatSettings', 'broadcasterId')
], HelixChatSettings);
exports.HelixChatSettings = HelixChatSettings;
