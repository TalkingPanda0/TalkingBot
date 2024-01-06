"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixHypeTrainApi = void 0;
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixHypeTrainEvent_1 = require("./HelixHypeTrainEvent");
/**
 * The Helix API methods that deal with Hype Trains.
 *
 * Can be accessed using `client.hypeTrain` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const { data: events } = await api.hypeTrain.getHypeTrainEventsForBroadcaster('125328655');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Hype Trains
 */
class HelixHypeTrainApi extends BaseApi_1.BaseApi {
    /**
     * Gets the events of the current or latest Hype Train for the specified broadcaster.
     *
     * @param broadcaster The broadcaster to fetch Hype Train events for.
     * @param pagination
     *
     * @expandParams
     */
    async getHypeTrainEventsForBroadcaster(broadcaster, pagination) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'hypetrain/events',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:hype_train'],
            query: {
                ...(0, api_call_1.createBroadcasterQuery)(broadcaster),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixHypeTrainEvent_1.HelixHypeTrainEvent, this._client);
    }
    /**
     * Creates a paginator for the events of the current or latest Hype Train for the specified broadcaster.
     *
     * @param broadcaster The broadcaster to fetch Hype Train events for.
     */
    getHypeTrainEventsForBroadcasterPaginated(broadcaster) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'hypetrain/events',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:hype_train'],
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        }, this._client, (data) => new HelixHypeTrainEvent_1.HelixHypeTrainEvent(data, this._client));
    }
}
exports.HelixHypeTrainApi = HelixHypeTrainApi;
