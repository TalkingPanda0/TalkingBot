"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixSearchApi = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const search_external_1 = require("../../interfaces/endpoints/search.external");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixGame_1 = require("../game/HelixGame");
const HelixChannelSearchResult_1 = require("./HelixChannelSearchResult");
/**
 * The Helix API methods that run searches.
 *
 * Can be accessed using `client.search` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const channels = await api.search.searchChannels('pear');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Search
 */
let HelixSearchApi = class HelixSearchApi extends BaseApi_1.BaseApi {
    /**
     * Search categories/games for an exact or partial match.
     *
     * @param query The search term.
     * @param pagination
     *
     * @expandParams
     */
    async searchCategories(query, pagination) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'search/categories',
            query: {
                query,
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixGame_1.HelixGame, this._client);
    }
    /**
     * Creates a paginator for a category/game search.
     *
     * @param query The search term.
     */
    searchCategoriesPaginated(query) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'search/categories',
            query: {
                query,
            },
        }, this._client, data => new HelixGame_1.HelixGame(data, this._client));
    }
    /**
     * Search channels for an exact or partial match.
     *
     * @param query The search term.
     * @param filter
     *
     * @expandParams
     */
    async searchChannels(query, filter = {}) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'search/channels',
            query: {
                ...(0, search_external_1.createSearchChannelsQuery)(query, filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixChannelSearchResult_1.HelixChannelSearchResult, this._client);
    }
    /**
     * Creates a paginator for a channel search.
     *
     * @param query The search term.
     * @param filter
     *
     * @expandParams
     */
    searchChannelsPaginated(query, filter = {}) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'search/channels',
            query: (0, search_external_1.createSearchChannelsQuery)(query, filter),
        }, this._client, data => new HelixChannelSearchResult_1.HelixChannelSearchResult(data, this._client));
    }
};
HelixSearchApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixSearchApi')
], HelixSearchApi);
exports.HelixSearchApi = HelixSearchApi;
