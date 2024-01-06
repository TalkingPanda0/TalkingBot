"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixExtensionsApi = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const extensions_external_1 = require("../../interfaces/endpoints/extensions.external");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixChannelReference_1 = require("../channel/HelixChannelReference");
const HelixExtensionBitsProduct_1 = require("./HelixExtensionBitsProduct");
const HelixExtensionTransaction_1 = require("./HelixExtensionTransaction");
/**
 * The Helix API methods that deal with extensions.
 *
 * Can be accessed using `client.extensions` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const transactions = await api.extionsions.getExtensionTransactions('abcd');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Extensions
 */
let HelixExtensionsApi = class HelixExtensionsApi extends BaseApi_1.BaseApi {
    /**
     * Gets a released extension by ID.
     *
     * @param extensionId The ID of the extension.
     * @param version The version of the extension. If not given, gets the latest version.
     */
    async getReleasedExtension(extensionId, version) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'extensions/released',
            query: (0, extensions_external_1.createReleasedExtensionFilter)(extensionId, version),
        });
        return new common_1.HelixExtension(result.data[0]);
    }
    /**
     * Gets a list of channels that are currently live and have the given extension installed.
     *
     * @param extensionId The ID of the extension.
     * @param pagination
     *
     * @expandParams
     */
    async getLiveChannelsWithExtension(extensionId, pagination) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'extensions/live',
            query: {
                ...(0, generic_external_1.createSingleKeyQuery)('extension_id', extensionId),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixChannelReference_1.HelixChannelReference, this._client);
    }
    /**
     * Creates a paginator for channels that are currently live and have the given extension installed.
     *
     * @param extensionId The ID of the extension.
     */
    getLiveChannelsWithExtensionPaginated(extensionId) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'extensions/live',
            query: (0, generic_external_1.createSingleKeyQuery)('extension_id', extensionId),
        }, this._client, data => new HelixChannelReference_1.HelixChannelReference(data, this._client));
    }
    /**
     * Gets an extension's Bits products.
     *
     * This only works if the provided token belongs to an extension's client ID,
     * and will return the products for that extension.
     *
     * @param includeDisabled Whether to include disabled/expired products.
     */
    async getExtensionBitsProducts(includeDisabled) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'bits/extensions',
            forceType: 'app',
            query: (0, generic_external_1.createSingleKeyQuery)('should_include_all', includeDisabled === null || includeDisabled === void 0 ? void 0 : includeDisabled.toString()),
        });
        return result.data.map(data => new HelixExtensionBitsProduct_1.HelixExtensionBitsProduct(data));
    }
    /**
     * Creates or updates a Bits product of an extension.
     *
     * This only works if the provided token belongs to an extension's client ID,
     * and will create/update a product for that extension.
     *
     * @param data
     *
     * @expandParams
     */
    async putExtensionBitsProduct(data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'bits/extensions',
            method: 'PUT',
            forceType: 'app',
            jsonBody: (0, extensions_external_1.createExtensionProductBody)(data),
        });
        return new HelixExtensionBitsProduct_1.HelixExtensionBitsProduct(result.data[0]);
    }
    /**
     * Gets a list of transactions for the given extension.
     *
     * @param extensionId The ID of the extension to get transactions for.
     * @param filter Additional filters.
     */
    async getExtensionTransactions(extensionId, filter = {}) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'extensions/transactions',
            forceType: 'app',
            query: {
                ...(0, extensions_external_1.createExtensionTransactionQuery)(extensionId, filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixExtensionTransaction_1.HelixExtensionTransaction, this._client);
    }
    /**
     * Creates a paginator for transactions for the given extension.
     *
     * @param extensionId The ID of the extension to get transactions for.
     * @param filter Additional filters.
     */
    getExtensionTransactionsPaginated(extensionId, filter = {}) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'extensions/transactions',
            forceType: 'app',
            query: (0, extensions_external_1.createExtensionTransactionQuery)(extensionId, filter),
        }, this._client, data => new HelixExtensionTransaction_1.HelixExtensionTransaction(data, this._client));
    }
};
HelixExtensionsApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixExtensionsApi')
], HelixExtensionsApi);
exports.HelixExtensionsApi = HelixExtensionsApi;
