"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixChatApi = void 0;
const tslib_1 = require("tslib");
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const chat_external_1 = require("../../interfaces/endpoints/chat.external");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const HelixPaginatedRequestWithTotal_1 = require("../../utils/pagination/HelixPaginatedRequestWithTotal");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixChannelEmote_1 = require("./HelixChannelEmote");
const HelixChatBadgeSet_1 = require("./HelixChatBadgeSet");
const HelixChatChatter_1 = require("./HelixChatChatter");
const HelixChatSettings_1 = require("./HelixChatSettings");
const HelixEmote_1 = require("./HelixEmote");
const HelixEmoteFromSet_1 = require("./HelixEmoteFromSet");
const HelixPrivilegedChatSettings_1 = require("./HelixPrivilegedChatSettings");
/**
 * The Helix API methods that deal with chat.
 *
 * Can be accessed using `client.chat` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const rewards = await api.chat.getChannelBadges('125328655');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Chat
 */
let HelixChatApi = class HelixChatApi extends BaseApi_1.BaseApi {
    /**
     * Gets the list of users that are connected to the broadcaster’s chat session.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster whose list of chatters you want to get.
     * @param pagination
     *
     * @expandParams
     */
    async getChatters(broadcaster, pagination) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/chatters',
            userId: broadcasterId,
            canOverrideScopedUserContext: true,
            scopes: ['moderator:read:chatters'],
            query: {
                ...this._createModeratorActionQuery(broadcasterId),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResultWithTotal)(result, HelixChatChatter_1.HelixChatChatter, this._client);
    }
    /**
     * Creates a paginator for users that are connected to the broadcaster’s chat session.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster whose list of chatters you want to get.
     *
     * @expandParams
     */
    getChattersPaginated(broadcaster) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        return new HelixPaginatedRequestWithTotal_1.HelixPaginatedRequestWithTotal({
            url: 'chat/chatters',
            userId: broadcasterId,
            canOverrideScopedUserContext: true,
            scopes: ['moderator:read:chatters'],
            query: this._createModeratorActionQuery(broadcasterId),
        }, this._client, data => new HelixChatChatter_1.HelixChatChatter(data, this._client));
    }
    /**
     * Gets all global badges.
     */
    async getGlobalBadges() {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/badges/global',
        });
        return result.data.map(data => new HelixChatBadgeSet_1.HelixChatBadgeSet(data));
    }
    /**
     * Gets all badges specific to the given broadcaster.
     *
     * @param broadcaster The broadcaster to get badges for.
     */
    async getChannelBadges(broadcaster) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/badges',
            userId: (0, common_1.extractUserId)(broadcaster),
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        });
        return result.data.map(data => new HelixChatBadgeSet_1.HelixChatBadgeSet(data));
    }
    /**
     * Gets all global emotes.
     */
    async getGlobalEmotes() {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/emotes/global',
        });
        return result.data.map(data => new HelixEmote_1.HelixEmote(data));
    }
    /**
     * Gets all emotes specific to the given broadcaster.
     *
     * @param broadcaster The broadcaster to get emotes for.
     */
    async getChannelEmotes(broadcaster) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/emotes',
            userId: (0, common_1.extractUserId)(broadcaster),
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        });
        return result.data.map(data => new HelixChannelEmote_1.HelixChannelEmote(data, this._client));
    }
    /**
     * Gets all emotes from a list of emote sets.
     *
     * @param setIds The IDs of the emote sets to get emotes from.
     */
    async getEmotesFromSets(setIds) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/emotes/set',
            query: (0, generic_external_1.createSingleKeyQuery)('emote_set_id', setIds),
        });
        return result.data.map(data => new HelixEmoteFromSet_1.HelixEmoteFromSet(data, this._client));
    }
    /**
     * Gets the settings of a broadcaster's chat.
     *
     * @param broadcaster The broadcaster the chat belongs to.
     */
    async getSettings(broadcaster) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/settings',
            userId: (0, common_1.extractUserId)(broadcaster),
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        });
        return new HelixChatSettings_1.HelixChatSettings(result.data[0]);
    }
    /**
     * Gets the settings of a broadcaster's chat, including the delay settings.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster the chat belongs to.
     */
    async getSettingsPrivileged(broadcaster) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/settings',
            userId: broadcasterId,
            canOverrideScopedUserContext: true,
            scopes: ['moderator:read:chat_settings'],
            query: this._createModeratorActionQuery(broadcasterId),
        });
        return new HelixPrivilegedChatSettings_1.HelixPrivilegedChatSettings(result.data[0]);
    }
    /**
     * Updates the settings of a broadcaster's chat.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @expandParams
     *
     * @param broadcaster The broadcaster the chat belongs to.
     * @param settings The settings to change.
     */
    async updateSettings(broadcaster, settings) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'chat/settings',
            method: 'PATCH',
            userId: broadcasterId,
            canOverrideScopedUserContext: true,
            scopes: ['moderator:manage:chat_settings'],
            query: this._createModeratorActionQuery(broadcasterId),
            jsonBody: (0, chat_external_1.createChatSettingsUpdateBody)(settings),
        });
        return new HelixPrivilegedChatSettings_1.HelixPrivilegedChatSettings(result.data[0]);
    }
    /**
     * Sends an announcement to a broadcaster's chat.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param broadcaster The broadcaster the chat belongs to.
     * @param announcement The announcement to send.
     */
    async sendAnnouncement(broadcaster, announcement) {
        const broadcasterId = (0, common_1.extractUserId)(broadcaster);
        await this._client.callApi({
            type: 'helix',
            url: 'chat/announcements',
            method: 'POST',
            userId: broadcasterId,
            canOverrideScopedUserContext: true,
            scopes: ['moderator:manage:announcements'],
            query: this._createModeratorActionQuery(broadcasterId),
            jsonBody: {
                message: announcement.message,
                color: announcement.color,
            },
        });
    }
    /**
     * Gets the chat colors for a list of users.
     *
     * Returns a Map with user IDs as keys and their colors as values.
     * The value is a color hex code, or `null` if the user did not set a color,
     * and unknown users will not be present in the map.
     *
     * @param users The users to get the chat colors of.
     */
    async getColorsForUsers(users) {
        const response = await this._client.callApi({
            type: 'helix',
            url: 'chat/color',
            query: (0, generic_external_1.createSingleKeyQuery)('user_id', users.map(common_1.extractUserId)),
        });
        return new Map(response.data.map(data => [data.user_id, data.color || null]));
    }
    /**
     * Gets the chat color for a user.
     *
     * Returns the color as hex code, `null` if the user did not set a color, or `undefined` if the user is unknown.
     *
     * @param user The user to get the chat color of.
     */
    async getColorForUser(user) {
        const response = await this._client.callApi({
            type: 'helix',
            url: 'chat/color',
            userId: (0, common_1.extractUserId)(user),
            query: (0, generic_external_1.createSingleKeyQuery)('user_id', (0, common_1.extractUserId)(user)),
        });
        if (!response.data.length) {
            return undefined;
        }
        return response.data[0].color || null;
    }
    /**
     * Changes the chat color for a user.
     *
     * @param user The user to change the color of.
     * @param color The color to set.
     *
     * Note that hex codes can only be used by users that have a Prime or Turbo subscription.
     */
    async setColorForUser(user, color) {
        await this._client.callApi({
            type: 'helix',
            url: 'chat/color',
            method: 'PUT',
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:manage:chat_color'],
            query: (0, chat_external_1.createChatColorUpdateQuery)(user, color),
        });
    }
    /**
     * Sends a shoutout to the specified broadcaster.
     * The broadcaster may send a shoutout once every 2 minutes. They may send the same broadcaster a shoutout once every 60 minutes.
     *
     * This uses the token of the broadcaster by default.
     * If you want to execute this in the context of another user (who has to be moderator of the channel)
     * you can do so using [user context overrides](/docs/auth/concepts/context-switching).
     *
     * @param from The ID of the broadcaster that’s sending the shoutout.
     * @param to The ID of the broadcaster that’s receiving the shoutout.
     */
    async shoutoutUser(from, to) {
        const fromId = (0, common_1.extractUserId)(from);
        await this._client.callApi({
            type: 'helix',
            url: 'chat/shoutouts',
            method: 'POST',
            userId: fromId,
            canOverrideScopedUserContext: true,
            scopes: ['moderator:manage:shoutouts'],
            query: (0, chat_external_1.createShoutoutQuery)(from, to, this._getUserContextIdWithDefault(fromId)),
        });
    }
    _createModeratorActionQuery(broadcasterId) {
        return (0, generic_external_1.createModeratorActionQuery)(broadcasterId, this._getUserContextIdWithDefault(broadcasterId));
    }
};
HelixChatApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixChatApi')
], HelixChatApi);
exports.HelixChatApi = HelixChatApi;
