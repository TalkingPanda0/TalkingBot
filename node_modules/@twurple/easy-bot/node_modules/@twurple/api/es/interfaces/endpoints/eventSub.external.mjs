import { extractUserId } from '@twurple/common';
/** @internal */
export function createEventSubBroadcasterCondition(broadcaster) {
    return {
        broadcaster_user_id: extractUserId(broadcaster),
    };
}
/** @internal */
export function createEventSubRewardCondition(broadcaster, rewardId) {
    return { broadcaster_user_id: extractUserId(broadcaster), reward_id: rewardId };
}
/** @internal */
export function createEventSubModeratorCondition(broadcasterId, moderatorId) {
    return {
        broadcaster_user_id: broadcasterId,
        moderator_user_id: moderatorId,
    };
}
/** @internal */
export function createEventSubDropEntitlementGrantCondition(filter) {
    return {
        organization_id: filter.organizationId,
        category_id: filter.categoryId,
        campaign_id: filter.campaignId,
    };
}
