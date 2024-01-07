"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixGameApi = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const HelixRequestBatcher_1 = require("../../utils/HelixRequestBatcher");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixGame_1 = require("./HelixGame");
/**
 * The Helix API methods that deal with games.
 *
 * Can be accessed using `client.games` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const game = await api.games.getGameByName('Hearthstone');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Games
 */
let HelixGameApi = class HelixGameApi extends BaseApi_1.BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */
        this._getGameByIdBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'games',
        }, 'id', 'id', this._client, (data) => new HelixGame_1.HelixGame(data, this._client));
        /** @internal */
        this._getGameByNameBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'games',
        }, 'name', 'name', this._client, (data) => new HelixGame_1.HelixGame(data, this._client));
        /** @internal */
        this._getGameByIgdbIdBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'games',
        }, 'igdb_id', 'igdb_id', this._client, (data) => new HelixGame_1.HelixGame(data, this._client));
    }
    /**
     * Gets the game data for the given list of game IDs.
     *
     * @param ids The game IDs you want to look up.
     */
    async getGamesByIds(ids) {
        return await this._getGames('id', ids);
    }
    /**
     * Gets the game data for the given list of game names.
     *
     * @param names The game names you want to look up.
     */
    async getGamesByNames(names) {
        return await this._getGames('name', names);
    }
    /**
     * Gets the game data for the given list of IGDB IDs.
     *
     * @param igdbIds The IGDB IDs you want to look up.
     */
    async getGamesByIgdbIds(igdbIds) {
        return await this._getGames('igdb_id', igdbIds);
    }
    /**
     * Gets the game data for the given game ID.
     *
     * @param id The game ID you want to look up.
     */
    async getGameById(id) {
        var _a;
        const games = await this._getGames('id', [id]);
        return (_a = games[0]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets the game data for the given game name.
     *
     * @param name The game name you want to look up.
     */
    async getGameByName(name) {
        var _a;
        const games = await this._getGames('name', [name]);
        return (_a = games[0]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets the game data for the given IGDB ID.
     *
     * @param igdbId The IGDB ID you want to look up.
     */
    async getGameByIgdbId(igdbId) {
        var _a;
        const games = await this._getGames('igdb_id', [igdbId]);
        return (_a = games[0]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets the game data for the given game ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param id The game ID you want to look up.
     */
    async getGameByIdBatched(id) {
        return await this._getGameByIdBatcher.request(id);
    }
    /**
     * Gets the game data for the given game name, batching multiple calls into fewer requests as the API allows.
     *
     * @param name The game name you want to look up.
     */
    async getGameByNameBatched(name) {
        return await this._getGameByNameBatcher.request(name);
    }
    /**
     * Gets the game data for the given IGDB ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param igdbId The IGDB ID you want to look up.
     */
    async getGameByIgdbIdBatched(igdbId) {
        return await this._getGameByIgdbIdBatcher.request(igdbId);
    }
    /**
     * Gets a list of the most viewed games at the moment.
     *
     * @param pagination
     *
     * @expandParams
     */
    async getTopGames(pagination) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'games/top',
            query: (0, HelixPagination_1.createPaginationQuery)(pagination),
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixGame_1.HelixGame, this._client);
    }
    /**
     * Creates a paginator for the most viewed games at the moment.
     */
    getTopGamesPaginated() {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'games/top',
        }, this._client, data => new HelixGame_1.HelixGame(data, this._client));
    }
    /** @internal */
    async _getGames(filterType, filterValues) {
        if (!filterValues.length) {
            return [];
        }
        const result = await this._client.callApi({
            type: 'helix',
            url: 'games',
            query: {
                [filterType]: filterValues,
            },
        });
        return result.data.map(entry => new HelixGame_1.HelixGame(entry, this._client));
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixGameApi.prototype, "_getGameByIdBatcher", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixGameApi.prototype, "_getGameByNameBatcher", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixGameApi.prototype, "_getGameByIgdbIdBatcher", void 0);
HelixGameApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixGameApi')
], HelixGameApi);
exports.HelixGameApi = HelixGameApi;
