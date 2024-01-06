import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { extractUserId, rtfm } from '@twurple/common';
import { createClipCreateQuery, createClipQuery, } from "../../interfaces/endpoints/clip.external.mjs";
import { HelixRequestBatcher } from "../../utils/HelixRequestBatcher.mjs";
import { HelixPaginatedRequest } from "../../utils/pagination/HelixPaginatedRequest.mjs";
import { createPaginatedResult } from "../../utils/pagination/HelixPaginatedResult.mjs";
import { createPaginationQuery } from "../../utils/pagination/HelixPagination.mjs";
import { BaseApi } from "../BaseApi.mjs";
import { HelixClip } from "./HelixClip.mjs";
/**
 * The Helix API methods that deal with clips.
 *
 * Can be accessed using `client.clips` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const clipId = await api.clips.createClip({ channel: '125328655' });
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Clips
 */
let HelixClipApi = class HelixClipApi extends BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */
        this._getClipByIdBatcher = new HelixRequestBatcher({
            url: 'clips',
        }, 'id', 'id', this._client, (data) => new HelixClip(data, this._client));
    }
    /**
     * Gets clips for the specified broadcaster in descending order of views.
     *
     * @param broadcaster The broadcaster to fetch clips for.
     * @param filter
     *
     * @expandParams
     */
    async getClipsForBroadcaster(broadcaster, filter = {}) {
        return await this._getClips({
            ...filter,
            filterType: 'broadcaster_id',
            ids: extractUserId(broadcaster),
            userId: extractUserId(broadcaster),
        });
    }
    /**
     * Creates a paginator for clips for the specified broadcaster.
     *
     * @param broadcaster The broadcaster to fetch clips for.
     * @param filter
     *
     * @expandParams
     */
    getClipsForBroadcasterPaginated(broadcaster, filter = {}) {
        return this._getClipsPaginated({
            ...filter,
            filterType: 'broadcaster_id',
            ids: extractUserId(broadcaster),
            userId: extractUserId(broadcaster),
        });
    }
    /**
     * Gets clips for the specified game in descending order of views.
     *
     * @param gameId The game ID.
     * @param filter
     *
     * @expandParams
     */
    async getClipsForGame(gameId, filter = {}) {
        return await this._getClips({
            ...filter,
            filterType: 'game_id',
            ids: gameId,
        });
    }
    /**
     * Creates a paginator for clips for the specified game.
     *
     * @param gameId The game ID.
     * @param filter
     *
     * @expandParams
     */
    getClipsForGamePaginated(gameId, filter = {}) {
        return this._getClipsPaginated({
            ...filter,
            filterType: 'game_id',
            ids: gameId,
        });
    }
    /**
     * Gets the clips identified by the given IDs.
     *
     * @param ids The clip IDs.
     */
    async getClipsByIds(ids) {
        const result = await this._getClips({
            filterType: 'id',
            ids,
        });
        return result.data;
    }
    /**
     * Gets the clip identified by the given ID.
     *
     * @param id The clip ID.
     */
    async getClipById(id) {
        const clips = await this.getClipsByIds([id]);
        return clips.length ? clips[0] : null;
    }
    /**
     * Gets the clip identified by the given ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param id The clip ID.
     */
    async getClipByIdBatched(id) {
        return await this._getClipByIdBatcher.request(id);
    }
    /**
     * Creates a clip of a running stream.
     *
     * Returns the ID of the clip.
     *
     * @param params
     * @expandParams
     */
    async createClip(params) {
        const { channel, createAfterDelay = false } = params;
        const result = await this._client.callApi({
            type: 'helix',
            url: 'clips',
            method: 'POST',
            userId: extractUserId(channel),
            scopes: ['clips:edit'],
            canOverrideScopedUserContext: true,
            query: createClipCreateQuery(channel, createAfterDelay),
        });
        return result.data[0].id;
    }
    async _getClips(params) {
        if (!params.ids.length) {
            return { data: [] };
        }
        const result = await this._client.callApi({
            type: 'helix',
            url: 'clips',
            userId: params.userId,
            query: {
                ...createClipQuery(params),
                ...createPaginationQuery(params),
            },
        });
        return createPaginatedResult(result, HelixClip, this._client);
    }
    _getClipsPaginated(params) {
        return new HelixPaginatedRequest({
            url: 'clips',
            userId: params.userId,
            query: createClipQuery(params),
        }, this._client, data => new HelixClip(data, this._client));
    }
};
__decorate([
    Enumerable(false)
], HelixClipApi.prototype, "_getClipByIdBatcher", void 0);
HelixClipApi = __decorate([
    rtfm('api', 'HelixClipApi')
], HelixClipApi);
export { HelixClipApi };
