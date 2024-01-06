"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixModerationApi = void 0;
const tslib_1 = require("tslib");
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const moderation_external_1 = require("../../interfaces/endpoints/moderation.external");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixAutoModSettings_1 = require("./HelixAutoModSettings");
const HelixAutoModStatus_1 = require("./HelixAutoModStatus");
const HelixBan_1 = require("./HelixBan");
const HelixBanUser_1 = require("./HelixBanUser");
const HelixBlockedTerm_1 = require("./HelixBlockedTerm");
const HelixModerator_1 = require("./HelixModerator");
const HelixShieldModeStatus_1 = require("./HelixShieldModeStatus");
/**
 * The Helix API methods that deal with moderation.
 *
 * Can be accessed using `client.moderation` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const { data: users } = await api.moderation.getBannedUsers('61369223');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Moderation
 */
let HelixModerationApi = class HelixModerationApi extends BaseApi_1.BaseApi {
    /**
     * Gets a list of banned users in a given channel.
     *
     * @param channel The channel to get the banned users from.
     * @param filter Additional filters for the result set.
     *
     * @expandParams
     */
    async getBannedUsers(channel, filter) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/banned',
            userId: (0, common_1.extractUserId)(channel),
            scopes: ['moderation:read'],
            query: {
                ...(0, moderation_external_1.createModerationUserListQuery)(channel, filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixBan_1.HelixBan, this._client);
    }
    /**
     * Creates a paginator for banned users in a given channel.
     *
     * @param channel The channel to get the banned users from.
     */
    getBannedUsersPaginated(channel) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'moderation/banned',
            userId: (0, common_1.extractUserId)(channel),
            scopes: ['moderation:read'],
            query: (0, api_call_1.createBroadcasterQuery)(channel),
        }, this._client, data => new HelixBan_1.HelixBan(data, this._client), 50);
    }
    /**
     * Checks whether a given user is banned in a given channel.
     *
     * @param channel The channel to check for a ban of the given user.
     * @param user The user to check for a ban in the given channel.
     */
    async checkUserBan(channel, user) {
        const userId = (0, common_1.extractUserId)(user);
        const result = await this.getBannedUsers(channel, { userId });
        return result.data.some(ban => ban.userId === userId);
    }
    /**
     * Gets a list of moderators in a given channel.
     *
     * @param channel The channel to get moderators from.
     * @param filter Additional filters for the result set.
     *
     * @expandParams
     */
    async getModerators(channel, filter) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/moderators',
            userId: (0, common_1.extractUserId)(channel),
            scopes: ['moderation:read', 'channel:manage:moderators'],
            query: {
                ...(0, moderation_external_1.createModerationUserListQuery)(channel, filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixModerator_1.HelixModerator, this._client);
    }
    /**
     * Creates a paginator for moderators in a given channel.
     *
     * @param channel The channel to get moderators from.
     */
    getModeratorsPaginated(channel) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'moderation/moderators',
            userId: (0, common_1.extractUserId)(channel),
            scopes: ['moderation:read', 'channel:manage:moderators'],
            query: (0, api_call_1.createBroadcasterQuery)(channel),
        }, this._client, data => new HelixModerator_1.HelixModerator(data, this._client));
    }
    /**
     * Checks whether a given user is a moderator of a given channel.
     *
     * @param channel The channel to check.
     * @param user The user to check.
     */
    async checkUserMod(channel, user) {
        const userId = (0, common_1.extractUserId)(user);
        const result = await this.getModerators(channel, { userId });
        return result.data.some(mod => mod.userId === userId);
    }
    /**
     * Adds a moderator to the broadcaster’s chat room.
     *
     * @param broadcaster The broadcaster that owns the chat room. This ID must match the user ID in the access token.
     * @param user The user to add as a moderator in the broadcaster’s chat room.
     */
    async addModerator(broadcaster, user) {
        await this._client.callApi({
            type: 'helix',
            url: 'moderation/moderators',
            method: 'POST',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:moderators'],
            query: (0, moderation_external_1.createModeratorModifyQuery)(broadcaster, user),
        });
    }
    /**
     * Removes a moderator from the broadcaster’s chat room.
     *
     * @param broadcaster The broadcaster that owns the chat room. This ID must match the user ID in the access token.
     * @param user The user to remove as a moderator from the broadcaster’s chat room.
     */
    async removeModerator(broadcaster, user) {
        await this._client.callApi({
            type: 'helix',
            url: 'moderation/moderators',
            method: 'DELETE',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:moderators'],
            query: (0, moderation_external_1.createModeratorModifyQuery)(broadcaster, user),
        });
    }
    /**
     * Determines whether a string message meets the channel's AutoMod requirements.
     *
     * @param channel The channel in which the messages to check are posted.
     * @param data An array of message data objects.
     */
    async checkAutoModStatus(channel, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/enforcements/status',
            method: 'POST',
            userId: (0, common_1.extractUserId)(channel),
            scopes: ['moderation:read'],
            query: (0, api_call_1.createBroadcasterQuery)(channel),
            jsonBody: {
                data,
            },
        });
        return result.data.map(statusData => new HelixAutoModStatus_1.HelixAutoModStatus(statusData));
    }
    /**
     * Processes a message held by AutoMod.
     *
     * @param user The user who is processing the message.
     * @param msgId The ID of the message.
     * @param allow Whether to allow the message - `true` allows, and `false` denies.
     */
    async processHeldAutoModMessage(user, msgId, allow) {
        await this._client.callApi({
            type: 'helix',
            url: 'moderation/automod/message',
            method: 'POST',
            userId: (0, common_1.extractUserId)(user),
            scopes: ['moderator:manage:automod'],
            jsonBody: (0, moderation_external_1.createAutoModProcessBody)(user, msgId, allow),
        });
    }
    /**
     * Gets the AutoMod settings for a broadcaster.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster to get the AutoMod settings for.
     */
    async getAutoModSettings(broadcaster) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/automod/settings',
            userId: broadcasterId,
            scopes: ['moderator:read:automod_settings'],
            canOverrideScopedUserContext: true,
            query: this._createModeratorActionQuery(broadcasterId),
        });
        return result.data.map(data => new HelixAutoModSettings_1.HelixAutoModSettings(data));
    }
    /**
     * Updates the AutoMod settings for a broadcaster.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster for which the AutoMod settings are updated.
     * @param data The updated AutoMod settings that replace the current AutoMod settings.
     */
    async updateAutoModSettings(broadcaster, data) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/automod/settings',
            method: 'PUT',
            userId: broadcasterId,
            scopes: ['moderator:manage:automod_settings'],
            canOverrideScopedUserContext: true,
            query: this._createModeratorActionQuery(broadcasterId),
            jsonBody: (0, moderation_external_1.createAutoModSettingsBody)(data),
        });
        return result.data.map(settingsData => new HelixAutoModSettings_1.HelixAutoModSettings(settingsData));
    }
    /**
     * Bans or times out a user in a channel.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster in whose channel the user will be banned/timed out.
     * @param data
     *
     * @expandParams
     *
     * @returns The result data from the ban/timeout request.
     */
    async banUser(broadcaster, data) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/bans',
            method: 'POST',
            userId: broadcasterId,
            scopes: ['moderator:manage:banned_users'],
            canOverrideScopedUserContext: true,
            query: this._createModeratorActionQuery(broadcasterId),
            jsonBody: (0, moderation_external_1.createBanUserBody)(data),
        });
        return result.data.map(banData => new HelixBanUser_1.HelixBanUser(banData, banData.end_time, this._client));
    }
    /**
     * Unbans/removes the timeout for a user in a channel.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster in whose channel the user will be unbanned/removed from timeout.
     * @param user The user who will be unbanned/removed from timeout.
     */
    async unbanUser(broadcaster, user) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        await this._client.callApi({
            type: 'helix',
            url: 'moderation/bans',
            method: 'DELETE',
            userId: broadcasterId,
            scopes: ['moderator:manage:banned_users'],
            canOverrideScopedUserContext: true,
            query: {
                ...this._createModeratorActionQuery(broadcasterId),
                ...(0, generic_external_1.createSingleKeyQuery)('user_id', (0, common_1.extractUserId)(user)),
            },
        });
    }
    /**
     * Gets the broadcaster’s list of non-private, blocked words or phrases.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster to get their channel's blocked terms for.
     * @param pagination
     *
     * @expandParams
     *
     * @returns A paginated list of blocked term data in the broadcaster's channel.
     */
    async getBlockedTerms(broadcaster, pagination) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/blocked_terms',
            userId: broadcasterId,
            scopes: ['moderator:read:blocked_terms'],
            canOverrideScopedUserContext: true,
            query: {
                ...this._createModeratorActionQuery(broadcasterId),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixBlockedTerm_1.HelixBlockedTerm, this._client);
    }
    /**
     * Adds a blocked term to the broadcaster's channel.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster in whose channel the term will be blocked.
     * @param text The word or phrase to block from being used in the broadcaster's channel.
     *
     * @returns Information about the term that has been blocked.
     */
    async addBlockedTerm(broadcaster, text) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/blocked_terms',
            method: 'POST',
            userId: broadcasterId,
            scopes: ['moderator:manage:blocked_terms'],
            canOverrideScopedUserContext: true,
            query: this._createModeratorActionQuery(broadcasterId),
            jsonBody: {
                text,
            },
        });
        return result.data.map(blockedTermData => new HelixBlockedTerm_1.HelixBlockedTerm(blockedTermData));
    }
    /**
     * Removes a blocked term from the broadcaster's channel.
     *
     * @param broadcaster The broadcaster in whose channel the term will be unblocked.
     * @param moderator A user that has permission to unblock terms in the broadcaster's channel.
     * The token of this user will be used to remove the blocked term.
     * @param id The ID of the term that should be unblocked.
     */
    async removeBlockedTerm(broadcaster, moderator, id) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        await this._client.callApi({
            type: 'helix',
            url: 'moderation/blocked_terms',
            method: 'DELETE',
            userId: broadcasterId,
            scopes: ['moderator:manage:blocked_terms'],
            canOverrideScopedUserContext: true,
            query: {
                ...this._createModeratorActionQuery(broadcasterId),
                id,
            },
        });
    }
    /**
     * Removes a single chat message or all chat messages from the broadcaster’s chat room.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster the chat belongs to.
     * @param messageId The ID of the message to remove. If not specified, the request removes all messages in the broadcaster’s chat room.
     */
    async deleteChatMessages(broadcaster, messageId) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        await this._client.callApi({
            type: 'helix',
            url: 'moderation/chat',
            method: 'DELETE',
            userId: broadcasterId,
            scopes: ['moderator:manage:chat_messages'],
            canOverrideScopedUserContext: true,
            query: {
                ...this._createModeratorActionQuery(broadcasterId),
                ...(0, generic_external_1.createSingleKeyQuery)('message_id', messageId),
            },
        });
    }
    /**
     * Gets the broadcaster's Shield Mode activation status.
     *
     * @param broadcaster The broadcaster whose Shield Mode activation status you want to get.
     */
    async getShieldModeStatus(broadcaster) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/shield_mode',
            method: 'GET',
            userId: broadcasterId,
            scopes: ['moderator:read:shield_mode', 'moderator:manage:shield_mode'],
            canOverrideScopedUserContext: true,
            query: this._createModeratorActionQuery(broadcasterId),
        });
        return new HelixShieldModeStatus_1.HelixShieldModeStatus(result.data[0], this._client);
    }
    /**
     * Activates or deactivates the broadcaster's Shield Mode.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster whose Shield Mode you want to activate or deactivate.
     * @param activate The desired Shield Mode status on the broadcaster's channel.
     */
    async updateShieldModeStatus(broadcaster, activate) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'moderation/shield_mode',
            method: 'PUT',
            userId: broadcasterId,
            scopes: ['moderator:manage:shield_mode'],
            canOverrideScopedUserContext: true,
            query: this._createModeratorActionQuery(broadcasterId),
            jsonBody: (0, moderation_external_1.createUpdateShieldModeStatusBody)(activate),
        });
        return new HelixShieldModeStatus_1.HelixShieldModeStatus(result.data[0], this._client);
    }
    _createModeratorActionQuery(broadcasterId) {
        return (0, generic_external_1.createModeratorActionQuery)(broadcasterId, this._getUserContextIdWithDefault(broadcasterId));
    }
};
HelixModerationApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixModerationApi')
], HelixModerationApi);
exports.HelixModerationApi = HelixModerationApi;
