import { createBroadcasterQuery } from '@twurple/api-call';
import { extractUserId } from '@twurple/common';
import { HelixPaginatedRequest } from "../../utils/pagination/HelixPaginatedRequest.mjs";
import { createPaginatedResult } from "../../utils/pagination/HelixPaginatedResult.mjs";
import { createPaginationQuery } from "../../utils/pagination/HelixPagination.mjs";
import { BaseApi } from "../BaseApi.mjs";
import { HelixHypeTrainEvent } from "./HelixHypeTrainEvent.mjs";
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
export class HelixHypeTrainApi extends BaseApi {
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
            userId: extractUserId(broadcaster),
            scopes: ['channel:read:hype_train'],
            query: {
                ...createBroadcasterQuery(broadcaster),
                ...createPaginationQuery(pagination),
            },
        });
        return createPaginatedResult(result, HelixHypeTrainEvent, this._client);
    }
    /**
     * Creates a paginator for the events of the current or latest Hype Train for the specified broadcaster.
     *
     * @param broadcaster The broadcaster to fetch Hype Train events for.
     */
    getHypeTrainEventsForBroadcasterPaginated(broadcaster) {
        return new HelixPaginatedRequest({
            url: 'hypetrain/events',
            userId: extractUserId(broadcaster),
            scopes: ['channel:read:hype_train'],
            query: createBroadcasterQuery(broadcaster),
        }, this._client, (data) => new HelixHypeTrainEvent(data, this._client));
    }
}
