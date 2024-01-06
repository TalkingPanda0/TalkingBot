"use strict";
var HelixStreamApi_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixStreamApi = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const StreamNotLiveError_1 = require("../../errors/StreamNotLiveError");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const stream_external_1 = require("../../interfaces/endpoints/stream.external");
const HelixRequestBatcher_1 = require("../../utils/HelixRequestBatcher");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixStream_1 = require("./HelixStream");
const HelixStreamMarker_1 = require("./HelixStreamMarker");
const HelixStreamMarkerWithVideo_1 = require("./HelixStreamMarkerWithVideo");
/**
 * The Helix API methods that deal with streams.
 *
 * Can be accessed using `client.streams` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const stream = await api.streams.getStreamByUserId('125328655');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Streams
 */
let HelixStreamApi = HelixStreamApi_1 = class HelixStreamApi extends BaseApi_1.BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */
        this._getStreamByUserIdBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'streams',
        }, 'user_id', 'user_id', this._client, (data) => new HelixStream_1.HelixStream(data, this._client));
        /** @internal */
        this._getStreamByUserNameBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'streams',
        }, 'user_login', 'user_login', this._client, (data) => new HelixStream_1.HelixStream(data, this._client));
    }
    /**
     * Gets a list of streams.
     *
     * @param filter
     * @expandParams
     */
    async getStreams(filter = {}) {
        const result = await this._client.callApi({
            url: 'streams',
            type: 'helix',
            query: {
                ...(0, stream_external_1.createStreamQuery)(filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixStream_1.HelixStream, this._client);
    }
    /**
     * Creates a paginator for streams.
     *
     * @param filter
     * @expandParams
     */
    getStreamsPaginated(filter = {}) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'streams',
            query: (0, stream_external_1.createStreamQuery)(filter),
        }, this._client, data => new HelixStream_1.HelixStream(data, this._client));
    }
    /**
     * Gets the current streams for the given usernames.
     *
     * @param users The username to get the streams for.
     */
    async getStreamsByUserNames(users) {
        const result = await this.getStreams({ userName: users.map(common_1.extractUserName) });
        return result.data;
    }
    /**
     * Gets the current stream for the given username.
     *
     * @param user The username to get the stream for.
     */
    async getStreamByUserName(user) {
        var _a;
        const result = await this.getStreamsByUserNames([user]);
        return (_a = result[0]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets the current stream for the given username, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The username to get the stream for.
     */
    async getStreamByUserNameBatched(user) {
        return await this._getStreamByUserNameBatcher.request((0, common_1.extractUserName)(user));
    }
    /**
     * Gets the current streams for the given user IDs.
     *
     * @param users The user IDs to get the streams for.
     */
    async getStreamsByUserIds(users) {
        const result = await this.getStreams({ userId: users.map(common_1.extractUserId) });
        return result.data;
    }
    /**
     * Gets the current stream for the given user ID.
     *
     * @param user The user ID to get the stream for.
     */
    async getStreamByUserId(user) {
        const userId = (0, common_1.extractUserId)(user);
        const result = await this._client.callApi({
            url: 'streams',
            type: 'helix',
            userId,
            query: (0, stream_external_1.createStreamQuery)({ userId }),
        });
        return (0, shared_utils_1.mapNullable)(result.data[0], data => new HelixStream_1.HelixStream(data, this._client));
    }
    /**
     * Gets the current stream for the given user ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The user ID to get the stream for.
     */
    async getStreamByUserIdBatched(user) {
        return await this._getStreamByUserIdBatcher.request((0, common_1.extractUserId)(user));
    }
    /**
     * Gets a list of all stream markers for a user.
     *
     * @param user The user to list the stream markers for.
     * @param pagination
     *
     * @expandParams
     */
    async getStreamMarkersForUser(user, pagination) {
        var _a;
        const result = await this._client.callApi({
            url: 'streams/markers',
            type: 'helix',
            query: {
                ...(0, generic_external_1.createUserQuery)(user),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:read:broadcast'],
            canOverrideScopedUserContext: true,
        });
        return {
            data: (0, shared_utils_1.flatten)(result.data.map(data => HelixStreamApi_1._mapGetStreamMarkersResult(data, this._client))),
            cursor: (_a = result.pagination) === null || _a === void 0 ? void 0 : _a.cursor,
        };
    }
    /**
     * Creates a paginator for all stream markers for a user.
     *
     * @param user The user to list the stream markers for.
     */
    getStreamMarkersForUserPaginated(user) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'streams/markers',
            query: (0, generic_external_1.createUserQuery)(user),
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:read:broadcast'],
            canOverrideScopedUserContext: true,
        }, this._client, data => HelixStreamApi_1._mapGetStreamMarkersResult(data, this._client));
    }
    /**
     * Gets a list of all stream markers for a video.
     *
     * @param user The user the video belongs to.
     * @param videoId The video to list the stream markers for.
     * @param pagination
     *
     * @expandParams
     */
    async getStreamMarkersForVideo(user, videoId, pagination) {
        var _a;
        const result = await this._client.callApi({
            url: 'streams/markers',
            type: 'helix',
            query: {
                ...(0, stream_external_1.createVideoQuery)(videoId),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:read:broadcast'],
            canOverrideScopedUserContext: true,
        });
        return {
            data: (0, shared_utils_1.flatten)(result.data.map(data => HelixStreamApi_1._mapGetStreamMarkersResult(data, this._client))),
            cursor: (_a = result.pagination) === null || _a === void 0 ? void 0 : _a.cursor,
        };
    }
    /**
     * Creates a paginator for all stream markers for a video.
     *
     * @param user The user the video belongs to.
     * @param videoId The video to list the stream markers for.
     */
    getStreamMarkersForVideoPaginated(user, videoId) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'streams/markers',
            query: (0, stream_external_1.createVideoQuery)(videoId),
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:read:broadcast'],
            canOverrideScopedUserContext: true,
        }, this._client, data => HelixStreamApi_1._mapGetStreamMarkersResult(data, this._client));
    }
    /**
     * Creates a new stream marker.
     *
     * Only works while the specified user's stream is live.
     *
     * @param broadcaster The broadcaster to create a stream marker for.
     * @param description The description of the marker.
     */
    async createStreamMarker(broadcaster, description) {
        try {
            const result = await this._client.callApi({
                url: 'streams/markers',
                method: 'POST',
                type: 'helix',
                userId: (0, common_1.extractUserId)(broadcaster),
                scopes: ['channel:manage:broadcast'],
                canOverrideScopedUserContext: true,
                jsonBody: (0, stream_external_1.createStreamMarkerBody)(broadcaster, description),
            });
            return new HelixStreamMarker_1.HelixStreamMarker(result.data[0], this._client);
        }
        catch (e) {
            if (e instanceof api_call_1.HttpStatusCodeError && e.statusCode === 404) {
                throw new StreamNotLiveError_1.StreamNotLiveError({ cause: e });
            }
            throw e;
        }
    }
    /**
     * Gets the stream key of a stream.
     *
     * @param broadcaster The broadcaster to get the stream key for.
     */
    async getStreamKey(broadcaster) {
        const userId = (0, common_1.extractUserId)(broadcaster);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'streams/key',
            userId,
            scopes: ['channel:read:stream_key'],
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        });
        return result.data[0].stream_key;
    }
    /**
     * Gets the streams that are currently live and are followed by the given user.
     *
     * @param user The user to check followed streams for.
     * @param pagination
     *
     * @expandParams
     */
    async getFollowedStreams(user, pagination) {
        const userId = (0, common_1.extractUserId)(user);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'streams/followed',
            userId,
            scopes: ['user:read:follows'],
            query: {
                ...(0, generic_external_1.createSingleKeyQuery)('user_id', userId),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixStream_1.HelixStream, this._client);
    }
    /**
     * Creates a paginator for the streams that are currently live and are followed by the given user.
     *
     * @param user The user to check followed streams for.
     */
    getFollowedStreamsPaginated(user) {
        const userId = (0, common_1.extractUserId)(user);
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'streams/followed',
            userId,
            scopes: ['user:read:follows'],
            query: (0, generic_external_1.createSingleKeyQuery)('user_id', userId),
        }, this._client, data => new HelixStream_1.HelixStream(data, this._client));
    }
    static _mapGetStreamMarkersResult(data, client) {
        return data.videos.reduce((result, video) => [
            ...result,
            ...video.markers.map(marker => new HelixStreamMarkerWithVideo_1.HelixStreamMarkerWithVideo(marker, video.video_id, client)),
        ], []);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixStreamApi.prototype, "_getStreamByUserIdBatcher", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixStreamApi.prototype, "_getStreamByUserNameBatcher", void 0);
HelixStreamApi = HelixStreamApi_1 = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixStreamApi')
], HelixStreamApi);
exports.HelixStreamApi = HelixStreamApi;
