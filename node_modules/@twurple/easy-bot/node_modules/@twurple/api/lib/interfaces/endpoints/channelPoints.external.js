"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedemptionsForBroadcasterQuery = exports.createRewardRedemptionsByIdsQuery = exports.createCustomRewardBody = exports.createCustomRewardChangeQuery = exports.createCustomRewardsQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createCustomRewardsQuery(broadcaster, onlyManageable) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        only_manageable_rewards: onlyManageable === null || onlyManageable === void 0 ? void 0 : onlyManageable.toString(),
    };
}
exports.createCustomRewardsQuery = createCustomRewardsQuery;
/** @internal */
function createCustomRewardChangeQuery(broadcaster, rewardId) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        id: rewardId,
    };
}
exports.createCustomRewardChangeQuery = createCustomRewardChangeQuery;
/** @internal */
function createCustomRewardBody(data) {
    var _a, _b, _c;
    const result = {
        title: data.title,
        cost: data.cost,
        prompt: data.prompt,
        background_color: data.backgroundColor,
        is_enabled: data.isEnabled,
        is_user_input_required: data.userInputRequired,
        should_redemptions_skip_request_queue: data.autoFulfill,
    };
    if (data.maxRedemptionsPerStream !== undefined) {
        result.is_max_per_stream_enabled = !!data.maxRedemptionsPerStream;
        result.max_per_stream = (_a = data.maxRedemptionsPerStream) !== null && _a !== void 0 ? _a : 0;
    }
    if (data.maxRedemptionsPerUserPerStream !== undefined) {
        result.is_max_per_user_per_stream_enabled = !!data.maxRedemptionsPerUserPerStream;
        result.max_per_user_per_stream = (_b = data.maxRedemptionsPerUserPerStream) !== null && _b !== void 0 ? _b : 0;
    }
    if (data.globalCooldown !== undefined) {
        result.is_global_cooldown_enabled = !!data.globalCooldown;
        result.global_cooldown_seconds = (_c = data.globalCooldown) !== null && _c !== void 0 ? _c : 0;
    }
    if ('isPaused' in data) {
        result.is_paused = data.isPaused;
    }
    return result;
}
exports.createCustomRewardBody = createCustomRewardBody;
/** @internal */
function createRewardRedemptionsByIdsQuery(broadcaster, rewardId, redemptionIds) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        reward_id: rewardId,
        id: redemptionIds,
    };
}
exports.createRewardRedemptionsByIdsQuery = createRewardRedemptionsByIdsQuery;
/** @internal */
function createRedemptionsForBroadcasterQuery(broadcaster, rewardId, status, filter) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        reward_id: rewardId,
        status,
        sort: filter.newestFirst ? 'NEWEST' : 'OLDEST',
    };
}
exports.createRedemptionsForBroadcasterQuery = createRedemptionsForBroadcasterQuery;
