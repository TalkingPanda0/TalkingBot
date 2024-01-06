"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixPredictionApi = void 0;
const tslib_1 = require("tslib");
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const prediction_external_1 = require("../../interfaces/endpoints/prediction.external");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixPrediction_1 = require("./HelixPrediction");
/**
 * The Helix API methods that deal with predictions.
 *
 * Can be accessed using `client.predictions` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const { data: predictions } = await api.helix.predictions.getPredictions('61369223');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Predictions
 */
let HelixPredictionApi = class HelixPredictionApi extends BaseApi_1.BaseApi {
    /**
     * Gets a list of predictions for the given broadcaster.
     *
     * @param broadcaster The broadcaster to get predictions for.
     * @param pagination
     *
     * @expandParams
     */
    async getPredictions(broadcaster, pagination) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'predictions',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:predictions'],
            query: {
                ...(0, api_call_1.createBroadcasterQuery)(broadcaster),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixPrediction_1.HelixPrediction, this._client);
    }
    /**
     * Creates a paginator for predictions for the given broadcaster.
     *
     * @param broadcaster The broadcaster to get predictions for.
     */
    getPredictionsPaginated(broadcaster) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'predictions',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:predictions'],
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        }, this._client, data => new HelixPrediction_1.HelixPrediction(data, this._client), 20);
    }
    /**
     * Gets predictions by IDs.
     *
     * @param broadcaster The broadcaster to get the predictions for.
     * @param ids The IDs of the predictions.
     */
    async getPredictionsByIds(broadcaster, ids) {
        if (!ids.length) {
            return [];
        }
        const result = await this._client.callApi({
            type: 'helix',
            url: 'predictions',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:predictions'],
            query: (0, generic_external_1.createGetByIdsQuery)(broadcaster, ids),
        });
        return result.data.map(data => new HelixPrediction_1.HelixPrediction(data, this._client));
    }
    /**
     * Gets a prediction by ID.
     *
     * @param broadcaster The broadcaster to get the prediction for.
     * @param id The ID of the prediction.
     */
    async getPredictionById(broadcaster, id) {
        const predictions = await this.getPredictionsByIds(broadcaster, [id]);
        return predictions.length ? predictions[0] : null;
    }
    /**
     * Creates a new prediction.
     *
     * @param broadcaster The broadcaster to create the prediction for.
     * @param data
     *
     * @expandParams
     */
    async createPrediction(broadcaster, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'predictions',
            method: 'POST',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:predictions'],
            jsonBody: (0, prediction_external_1.createPredictionBody)(broadcaster, data),
        });
        return new HelixPrediction_1.HelixPrediction(result.data[0], this._client);
    }
    /**
     * Locks a prediction.
     *
     * @param broadcaster The broadcaster to lock the prediction for.
     * @param id The ID of the prediction to lock.
     */
    async lockPrediction(broadcaster, id) {
        return await this._endPrediction(broadcaster, id, 'LOCKED');
    }
    /**
     * Resolves a prediction.
     *
     * @param broadcaster The broadcaster to resolve the prediction for.
     * @param id The ID of the prediction to resolve.
     * @param outcomeId The ID of the winning outcome.
     */
    async resolvePrediction(broadcaster, id, outcomeId) {
        return await this._endPrediction(broadcaster, id, 'RESOLVED', outcomeId);
    }
    /**
     * Cancels a prediction.
     *
     * @param broadcaster The broadcaster to cancel the prediction for.
     * @param id The ID of the prediction to cancel.
     */
    async cancelPrediction(broadcaster, id) {
        return await this._endPrediction(broadcaster, id, 'CANCELED');
    }
    async _endPrediction(broadcaster, id, status, outcomeId) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'predictions',
            method: 'PATCH',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:predictions'],
            jsonBody: (0, prediction_external_1.createEndPredictionBody)(broadcaster, id, status, outcomeId),
        });
        return new HelixPrediction_1.HelixPrediction(result.data[0], this._client);
    }
};
HelixPredictionApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixPredictionApi')
], HelixPredictionApi);
exports.HelixPredictionApi = HelixPredictionApi;
