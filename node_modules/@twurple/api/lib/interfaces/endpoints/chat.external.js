"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShoutoutQuery = exports.createChatColorUpdateQuery = exports.createChatSettingsUpdateBody = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createChatSettingsUpdateBody(settings) {
    return {
        slow_mode: settings.slowModeEnabled,
        slow_mode_wait_time: settings.slowModeDelay,
        follower_mode: settings.followerOnlyModeEnabled,
        follower_mode_duration: settings.followerOnlyModeDelay,
        subscriber_mode: settings.subscriberOnlyModeEnabled,
        emote_mode: settings.emoteOnlyModeEnabled,
        unique_chat_mode: settings.uniqueChatModeEnabled,
        non_moderator_chat_delay: settings.nonModeratorChatDelayEnabled,
        non_moderator_chat_delay_duration: settings.nonModeratorChatDelay,
    };
}
exports.createChatSettingsUpdateBody = createChatSettingsUpdateBody;
/** @internal */
function createChatColorUpdateQuery(user, color) {
    return {
        user_id: (0, common_1.extractUserId)(user),
        color,
    };
}
exports.createChatColorUpdateQuery = createChatColorUpdateQuery;
/** @internal */
function createShoutoutQuery(from, to, moderatorId) {
    return {
        from_broadcaster_id: (0, common_1.extractUserId)(from),
        to_broadcaster_id: (0, common_1.extractUserId)(to),
        moderator_id: moderatorId,
    };
}
exports.createShoutoutQuery = createShoutoutQuery;
