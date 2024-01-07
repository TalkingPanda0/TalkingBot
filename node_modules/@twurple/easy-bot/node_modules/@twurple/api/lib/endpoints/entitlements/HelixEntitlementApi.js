"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixEntitlementApi = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const entitlement_external_1 = require("../../interfaces/endpoints/entitlement.external");
const HelixRequestBatcher_1 = require("../../utils/HelixRequestBatcher");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixDropsEntitlement_1 = require("./HelixDropsEntitlement");
/**
 * The Helix API methods that deal with entitlements (drops).
 *
 * Can be accessed using `client.entitlements` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const clipId = await api.entitlements.getDropsEntitlements();
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Entitlements (Drops)
 */
let HelixEntitlementApi = class HelixEntitlementApi extends BaseApi_1.BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */ this._getDropsEntitlementByIdBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'entitlements/drops',
        }, 'id', 'id', this._client, (data) => new HelixDropsEntitlement_1.HelixDropsEntitlement(data, this._client));
    }
    /**
     * Gets the drops entitlements for the given filter.
     *
     * @expandParams
     *
     * @param filter
     * @param alwaysApp Whether an app token should always be used, even if a user filter is given.
     */
    async getDropsEntitlements(filter, alwaysApp = false) {
        const response = await this._client.callApi({
            type: 'helix',
            url: 'entitlements/drops',
            userId: (0, shared_utils_1.mapOptional)(filter.user, common_1.extractUserId),
            forceType: filter.user && alwaysApp ? 'app' : undefined,
            query: {
                ...(0, entitlement_external_1.createDropsEntitlementQuery)(filter, alwaysApp),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(response, HelixDropsEntitlement_1.HelixDropsEntitlement, this._client);
    }
    /**
     * Creates a paginator for drops entitlements for the given filter.
     *
     * @expandParams
     *
     * @param filter
     * @param alwaysApp Whether an app token should always be used, even if a user filter is given.
     */
    getDropsEntitlementsPaginated(filter, alwaysApp = false) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'entitlements/drops',
            userId: (0, shared_utils_1.mapOptional)(filter.user, common_1.extractUserId),
            forceType: filter.user && alwaysApp ? 'app' : undefined,
            query: (0, entitlement_external_1.createDropsEntitlementQuery)(filter, alwaysApp),
        }, this._client, data => new HelixDropsEntitlement_1.HelixDropsEntitlement(data, this._client));
    }
    /**
     * Gets the drops entitlements for the given IDs.
     *
     * @param ids The IDs to fetch.
     */
    async getDropsEntitlementsByIds(ids) {
        const response = await this._client.callApi({
            type: 'helix',
            url: 'entitlements/drops',
            query: {
                id: ids,
            },
        });
        return response.data.map(data => new HelixDropsEntitlement_1.HelixDropsEntitlement(data, this._client));
    }
    /**
     * Gets the drops entitlement for the given ID.
     *
     * @param id The ID to fetch.
     */
    async getDropsEntitlementById(id) {
        var _a;
        const result = await this.getDropsEntitlementsByIds([id]);
        return (_a = result[0]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Gets the drops entitlement for the given ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param id The ID to fetch.
     */
    async getDropsEntitlementByIdBatched(id) {
        return await this._getDropsEntitlementByIdBatcher.request(id);
    }
    /**
     * Updates the status of a list of drops entitlements.
     *
     * Returns a map that associates each given ID with its update status.
     *
     * @param ids The IDs of the entitlements.
     * @param fulfillmentStatus The fulfillment status to set the entitlements to.
     */
    async updateDropsEntitlements(ids, fulfillmentStatus) {
        const response = await this._client.callApi({
            type: 'helix',
            url: 'entitlements/drops',
            method: 'PATCH',
            jsonBody: (0, entitlement_external_1.createDropsEntitlementUpdateBody)(ids, fulfillmentStatus),
        });
        return new Map(response.data.flatMap(entry => entry.ids.map(id => [id, entry.status])));
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixEntitlementApi.prototype, "_getDropsEntitlementByIdBatcher", void 0);
HelixEntitlementApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixEntitlementApi')
], HelixEntitlementApi);
exports.HelixEntitlementApi = HelixEntitlementApi;
