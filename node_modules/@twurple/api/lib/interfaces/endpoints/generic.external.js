"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChannelUsersCheckQuery = exports.createGetByIdsQuery = exports.createModeratorActionQuery = exports.createUserQuery = exports.createSingleKeyQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createSingleKeyQuery(key, value) {
    return { [key]: value };
}
exports.createSingleKeyQuery = createSingleKeyQuery;
/** @internal */
function createUserQuery(user) {
    return {
        user_id: (0, common_1.extractUserId)(user),
    };
}
exports.createUserQuery = createUserQuery;
/** @internal */
function createModeratorActionQuery(broadcaster, moderatorId) {
    return {
        broadcaster_id: broadcaster,
        moderator_id: moderatorId,
    };
}
exports.createModeratorActionQuery = createModeratorActionQuery;
/** @internal */
function createGetByIdsQuery(broadcaster, rewardIds) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        id: rewardIds,
    };
}
exports.createGetByIdsQuery = createGetByIdsQuery;
/** @internal */
function createChannelUsersCheckQuery(broadcaster, users) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        user_id: users.map(common_1.extractUserId),
    };
}
exports.createChannelUsersCheckQuery = createChannelUsersCheckQuery;
