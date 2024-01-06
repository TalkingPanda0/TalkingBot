"use strict";
var HelixVideoApi_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixVideoApi = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const HelixRequestBatcher_1 = require("../../utils/HelixRequestBatcher");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixVideo_1 = require("./HelixVideo");
/**
 * The Helix API methods that deal with videos.
 *
 * Can be accessed using `client.videos` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const { data: videos } = await api.videos.getVideosByUser('125328655');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Videos
 */
let HelixVideoApi = HelixVideoApi_1 = class HelixVideoApi extends BaseApi_1.BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */
        this._getVideoByIdBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'videos',
        }, 'id', 'id', this._client, (data) => new HelixVideo_1.HelixVideo(data, this._client));
    }
    /**
     * Gets the video data for the given list of video IDs.
     *
     * @param ids The video IDs you want to look up.
     */
    async getVideosByIds(ids) {
        const result = await this._getVideos('id', ids);
        return result.data;
    }
    /**
     * Gets the video data for the given video ID.
     *
     * @param id The video ID you want to look up.
     */
    async getVideoById(id) {
        const videos = await this.getVideosByIds([id]);
        return videos.length ? videos[0] : null;
    }
    /**
     * Gets the video data for the given video ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param id The video ID you want to look up.
     */
    async getVideoByIdBatched(id) {
        return await this._getVideoByIdBatcher.request(id);
    }
    /**
     * Gets the videos of the given user.
     *
     * @param user The user you want to get videos from.
     * @param filter
     *
     * @expandParams
     */
    async getVideosByUser(user, filter = {}) {
        const userId = (0, common_1.extractUserId)(user);
        return await this._getVideos('user_id', [userId], filter);
    }
    /**
     * Creates a paginator for videos of the given user.
     *
     * @param user The user you want to get videos from.
     * @param filter
     *
     * @expandParams
     */
    getVideosByUserPaginated(user, filter = {}) {
        const userId = (0, common_1.extractUserId)(user);
        return this._getVideosPaginated('user_id', [userId], filter);
    }
    /**
     * Gets the videos of the given game.
     *
     * @param gameId The game you want to get videos from.
     * @param filter
     *
     * @expandParams
     */
    async getVideosByGame(gameId, filter = {}) {
        return await this._getVideos('game_id', [gameId], filter);
    }
    /**
     * Creates a paginator for videos of the given game.
     *
     * @param gameId The game you want to get videos from.
     * @param filter
     *
     * @expandParams
     */
    getVideosByGamePaginated(gameId, filter = {}) {
        return this._getVideosPaginated('game_id', [gameId], filter);
    }
    /**
     * Deletes videos by its IDs.
     *
     * @param broadcaster The broadcaster to delete the videos for.
     * @param ids The IDs of the videos to delete.
     */
    async deleteVideosByIds(broadcaster, ids) {
        await this._client.callApi({
            type: 'helix',
            url: 'videos',
            method: 'DELETE',
            scopes: ['channel:manage:videos'],
            userId: (0, common_1.extractUserId)(broadcaster),
            query: {
                id: ids,
            },
        });
    }
    /** @internal */
    async _getVideos(filterType, filterValues, filter = {}) {
        if (!filterValues.length) {
            return { data: [] };
        }
        const result = await this._client.callApi({
            type: 'helix',
            url: 'videos',
            userId: filterType === 'user_id' ? filterValues[0] : undefined,
            query: {
                ...HelixVideoApi_1._makeVideosQuery(filterType, filterValues, filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixVideo_1.HelixVideo, this._client);
    }
    /** @internal */
    _getVideosPaginated(filterType, filterValues, filter = {}) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'videos',
            userId: filterType === 'user_id' ? filterValues[0] : undefined,
            query: HelixVideoApi_1._makeVideosQuery(filterType, filterValues, filter),
        }, this._client, data => new HelixVideo_1.HelixVideo(data, this._client));
    }
    /** @internal */
    static _makeVideosQuery(filterType, filterValues, filter = {}) {
        const { language, period, orderBy, type } = filter;
        return {
            [filterType]: filterValues,
            language,
            period,
            sort: orderBy,
            type,
        };
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixVideoApi.prototype, "_getVideoByIdBatcher", void 0);
HelixVideoApi = HelixVideoApi_1 = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixVideoApi')
], HelixVideoApi);
exports.HelixVideoApi = HelixVideoApi;
