import { __decorate } from "tslib";
import { Enumerable, mapOptional } from '@d-fischer/shared-utils';
import { extractUserId, rtfm } from '@twurple/common';
import { createDropsEntitlementQuery, createDropsEntitlementUpdateBody, } from "../../interfaces/endpoints/entitlement.external.mjs";
import { HelixRequestBatcher } from "../../utils/HelixRequestBatcher.mjs";
import { HelixPaginatedRequest } from "../../utils/pagination/HelixPaginatedRequest.mjs";
import { createPaginatedResult } from "../../utils/pagination/HelixPaginatedResult.mjs";
import { createPaginationQuery } from "../../utils/pagination/HelixPagination.mjs";
import { BaseApi } from "../BaseApi.mjs";
import { HelixDropsEntitlement } from "./HelixDropsEntitlement.mjs";
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
let HelixEntitlementApi = class HelixEntitlementApi extends BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */ this._getDropsEntitlementByIdBatcher = new HelixRequestBatcher({
            url: 'entitlements/drops',
        }, 'id', 'id', this._client, (data) => new HelixDropsEntitlement(data, this._client));
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
            userId: mapOptional(filter.user, extractUserId),
            forceType: filter.user && alwaysApp ? 'app' : undefined,
            query: {
                ...createDropsEntitlementQuery(filter, alwaysApp),
                ...createPaginationQuery(filter),
            },
        });
        return createPaginatedResult(response, HelixDropsEntitlement, this._client);
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
        return new HelixPaginatedRequest({
            url: 'entitlements/drops',
            userId: mapOptional(filter.user, extractUserId),
            forceType: filter.user && alwaysApp ? 'app' : undefined,
            query: createDropsEntitlementQuery(filter, alwaysApp),
        }, this._client, data => new HelixDropsEntitlement(data, this._client));
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
        return response.data.map(data => new HelixDropsEntitlement(data, this._client));
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
            jsonBody: createDropsEntitlementUpdateBody(ids, fulfillmentStatus),
        });
        return new Map(response.data.flatMap(entry => entry.ids.map(id => [id, entry.status])));
    }
};
__decorate([
    Enumerable(false)
], HelixEntitlementApi.prototype, "_getDropsEntitlementByIdBatcher", void 0);
HelixEntitlementApi = __decorate([
    rtfm('api', 'HelixEntitlementApi')
], HelixEntitlementApi);
export { HelixEntitlementApi };
