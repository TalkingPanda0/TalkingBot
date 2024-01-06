import { mapOptional } from '@d-fischer/shared-utils';
import { extractUserId } from '@twurple/common';
/** @internal */
export function createChannelUpdateBody(data) {
    var _a;
    return {
        game_id: data.gameId,
        broadcaster_language: data.language,
        title: data.title,
        delay: (_a = data.delay) === null || _a === void 0 ? void 0 : _a.toString(),
        tags: data.tags,
        content_classification_labels: data.contentClassificationLabels,
        is_branded_content: data.isBrandedContent,
    };
}
/** @internal */
export function createChannelCommercialBody(broadcaster, length) {
    return {
        broadcaster_id: extractUserId(broadcaster),
        length,
    };
}
/** @internal */
export function createChannelVipUpdateQuery(broadcaster, user) {
    return {
        broadcaster_id: extractUserId(broadcaster),
        user_id: extractUserId(user),
    };
}
/** @internal */
export function createChannelFollowerQuery(broadcaster, user) {
    return {
        broadcaster_id: extractUserId(broadcaster),
        user_id: mapOptional(user, extractUserId),
    };
}
/** @internal */
export function createFollowedChannelQuery(user, broadcaster) {
    return {
        broadcaster_id: mapOptional(broadcaster, extractUserId),
        user_id: extractUserId(user),
    };
}
