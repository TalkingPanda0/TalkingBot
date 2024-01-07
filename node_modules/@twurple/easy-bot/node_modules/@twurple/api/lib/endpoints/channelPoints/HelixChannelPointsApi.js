"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixChannelPointsApi = void 0;
const tslib_1 = require("tslib");
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const channelPoints_external_1 = require("../../interfaces/endpoints/channelPoints.external");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixCustomReward_1 = require("./HelixCustomReward");
const HelixCustomRewardRedemption_1 = require("./HelixCustomRewardRedemption");
/**
 * The Helix API methods that deal with channel points.
 *
 * Can be accessed using `client.channelPoints` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const rewards = await api.channelPoints.getCustomRewards('125328655');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Channel points
 */
let HelixChannelPointsApi = class HelixChannelPointsApi extends BaseApi_1.BaseApi {
    /**
     * Gets all custom rewards for the given broadcaster.
     *
     * @param broadcaster The broadcaster to get the rewards for.
     * @param onlyManageable Whether to only get rewards that can be managed by the API.
     */
    async getCustomRewards(broadcaster, onlyManageable) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:redemptions', 'channel:manage:redemptions'],
            query: (0, channelPoints_external_1.createCustomRewardsQuery)(broadcaster, onlyManageable),
        });
        return result.data.map(data => new HelixCustomReward_1.HelixCustomReward(data, this._client));
    }
    /**
     * Gets custom rewards by IDs.
     *
     * @param broadcaster The broadcaster to get the rewards for.
     * @param rewardIds The IDs of the rewards.
     */
    async getCustomRewardsByIds(broadcaster, rewardIds) {
        if (!rewardIds.length) {
            return [];
        }
        const result = await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:redemptions', 'channel:manage:redemptions'],
            query: (0, generic_external_1.createGetByIdsQuery)(broadcaster, rewardIds),
        });
        return result.data.map(data => new HelixCustomReward_1.HelixCustomReward(data, this._client));
    }
    /**
     * Gets a custom reward by ID.
     *
     * @param broadcaster The broadcaster to get the reward for.
     * @param rewardId The ID of the reward.
     */
    async getCustomRewardById(broadcaster, rewardId) {
        const rewards = await this.getCustomRewardsByIds(broadcaster, [rewardId]);
        return rewards.length ? rewards[0] : null;
    }
    /**
     * Creates a new custom reward.
     *
     * @param broadcaster The broadcaster to create the reward for.
     * @param data The reward data.
     *
     * @expandParams
     */
    async createCustomReward(broadcaster, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards',
            method: 'POST',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:redemptions'],
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
            jsonBody: (0, channelPoints_external_1.createCustomRewardBody)(data),
        });
        return new HelixCustomReward_1.HelixCustomReward(result.data[0], this._client);
    }
    /**
     * Updates a custom reward.
     *
     * @param broadcaster The broadcaster to update the reward for.
     * @param rewardId The ID of the reward.
     * @param data The reward data.
     */
    async updateCustomReward(broadcaster, rewardId, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards',
            method: 'PATCH',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:redemptions'],
            query: (0, channelPoints_external_1.createCustomRewardChangeQuery)(broadcaster, rewardId),
            jsonBody: (0, channelPoints_external_1.createCustomRewardBody)(data),
        });
        return new HelixCustomReward_1.HelixCustomReward(result.data[0], this._client);
    }
    /**
     * Deletes a custom reward.
     *
     * @param broadcaster The broadcaster to delete the reward for.
     * @param rewardId The ID of the reward.
     */
    async deleteCustomReward(broadcaster, rewardId) {
        await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards',
            method: 'DELETE',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:redemptions'],
            query: (0, channelPoints_external_1.createCustomRewardChangeQuery)(broadcaster, rewardId),
        });
    }
    /**
     * Gets custom reward redemptions by IDs.
     *
     * @param broadcaster The broadcaster to get the redemptions for.
     * @param rewardId The ID of the reward.
     * @param redemptionIds The IDs of the redemptions.
     */
    async getRedemptionsByIds(broadcaster, rewardId, redemptionIds) {
        if (!redemptionIds.length) {
            return [];
        }
        const result = await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards/redemptions',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:redemptions', 'channel:manage:redemptions'],
            query: (0, channelPoints_external_1.createRewardRedemptionsByIdsQuery)(broadcaster, rewardId, redemptionIds),
        });
        return result.data.map(data => new HelixCustomRewardRedemption_1.HelixCustomRewardRedemption(data, this._client));
    }
    /**
     * Gets a custom reward redemption by ID.
     *
     * @param broadcaster The broadcaster to get the redemption for.
     * @param rewardId The ID of the reward.
     * @param redemptionId The ID of the redemption.
     */
    async getRedemptionById(broadcaster, rewardId, redemptionId) {
        const redemptions = await this.getRedemptionsByIds(broadcaster, rewardId, [redemptionId]);
        return redemptions.length ? redemptions[0] : null;
    }
    /**
     * Gets custom reward redemptions for the given broadcaster.
     *
     * @param broadcaster The broadcaster to get the redemptions for.
     * @param rewardId The ID of the reward.
     * @param status The status of the redemptions to get.
     * @param filter
     *
     * @expandParams
     */
    async getRedemptionsForBroadcaster(broadcaster, rewardId, status, filter) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards/redemptions',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:redemptions', 'channel:manage:redemptions'],
            query: {
                ...(0, channelPoints_external_1.createRedemptionsForBroadcasterQuery)(broadcaster, rewardId, status, filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixCustomRewardRedemption_1.HelixCustomRewardRedemption, this._client);
    }
    /**
     * Creates a paginator for custom reward redemptions for the given broadcaster.
     *
     * @param broadcaster The broadcaster to get the redemptions for.
     * @param rewardId The ID of the reward.
     * @param status The status of the redemptions to get.
     * @param filter
     *
     * @expandParams
     */
    getRedemptionsForBroadcasterPaginated(broadcaster, rewardId, status, filter) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'channel_points/custom_rewards/redemptions',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:redemptions', 'channel:manage:redemptions'],
            query: (0, channelPoints_external_1.createRedemptionsForBroadcasterQuery)(broadcaster, rewardId, status, filter),
        }, this._client, data => new HelixCustomRewardRedemption_1.HelixCustomRewardRedemption(data, this._client), 50);
    }
    /**
     * Updates the status of the given redemptions by IDs.
     *
     * @param broadcaster The broadcaster to update the redemptions for.
     * @param rewardId The ID of the reward.
     * @param redemptionIds The IDs of the redemptions to update.
     * @param status The status to set for the redemptions.
     */
    async updateRedemptionStatusByIds(broadcaster, rewardId, redemptionIds, status) {
        if (!redemptionIds.length) {
            return [];
        }
        const result = await this._client.callApi({
            type: 'helix',
            url: 'channel_points/custom_rewards/redemptions',
            method: 'PATCH',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:redemptions'],
            query: (0, channelPoints_external_1.createRewardRedemptionsByIdsQuery)(broadcaster, rewardId, redemptionIds),
            jsonBody: {
                status,
            },
        });
        return result.data.map(data => new HelixCustomRewardRedemption_1.HelixCustomRewardRedemption(data, this._client));
    }
};
HelixChannelPointsApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixChannelPointsApi')
], HelixChannelPointsApi);
exports.HelixChannelPointsApi = HelixChannelPointsApi;
