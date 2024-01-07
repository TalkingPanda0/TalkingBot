"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSubDropEntitlementGrantCondition = exports.createEventSubModeratorCondition = exports.createEventSubRewardCondition = exports.createEventSubBroadcasterCondition = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createEventSubBroadcasterCondition(broadcaster) {
    return {
        broadcaster_user_id: (0, common_1.extractUserId)(broadcaster),
    };
}
exports.createEventSubBroadcasterCondition = createEventSubBroadcasterCondition;
/** @internal */
function createEventSubRewardCondition(broadcaster, rewardId) {
    return { broadcaster_user_id: (0, common_1.extractUserId)(broadcaster), reward_id: rewardId };
}
exports.createEventSubRewardCondition = createEventSubRewardCondition;
/** @internal */
function createEventSubModeratorCondition(broadcasterId, moderatorId) {
    return {
        broadcaster_user_id: broadcasterId,
        moderator_user_id: moderatorId,
    };
}
exports.createEventSubModeratorCondition = createEventSubModeratorCondition;
/** @internal */
function createEventSubDropEntitlementGrantCondition(filter) {
    return {
        organization_id: filter.organizationId,
        category_id: filter.categoryId,
        campaign_id: filter.campaignId,
    };
}
exports.createEventSubDropEntitlementGrantCondition = createEventSubDropEntitlementGrantCondition;
