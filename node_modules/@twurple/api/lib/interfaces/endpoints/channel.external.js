"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollowedChannelQuery = exports.createChannelFollowerQuery = exports.createChannelVipUpdateQuery = exports.createChannelCommercialBody = exports.createChannelUpdateBody = void 0;
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/** @internal */
function createChannelUpdateBody(data) {
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
exports.createChannelUpdateBody = createChannelUpdateBody;
/** @internal */
function createChannelCommercialBody(broadcaster, length) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        length,
    };
}
exports.createChannelCommercialBody = createChannelCommercialBody;
/** @internal */
function createChannelVipUpdateQuery(broadcaster, user) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        user_id: (0, common_1.extractUserId)(user),
    };
}
exports.createChannelVipUpdateQuery = createChannelVipUpdateQuery;
/** @internal */
function createChannelFollowerQuery(broadcaster, user) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        user_id: (0, shared_utils_1.mapOptional)(user, common_1.extractUserId),
    };
}
exports.createChannelFollowerQuery = createChannelFollowerQuery;
/** @internal */
function createFollowedChannelQuery(user, broadcaster) {
    return {
        broadcaster_id: (0, shared_utils_1.mapOptional)(broadcaster, common_1.extractUserId),
        user_id: (0, common_1.extractUserId)(user),
    };
}
exports.createFollowedChannelQuery = createFollowedChannelQuery;
