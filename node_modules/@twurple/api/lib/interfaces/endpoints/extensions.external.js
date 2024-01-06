"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtensionTransactionQuery = exports.createExtensionProductBody = exports.createReleasedExtensionFilter = void 0;
/** @internal */
function createReleasedExtensionFilter(extensionId, version) {
    return {
        extension_id: extensionId,
        extension_version: version,
    };
}
exports.createReleasedExtensionFilter = createReleasedExtensionFilter;
/** @internal */
function createExtensionProductBody(data) {
    return {
        sku: data.sku,
        cost: {
            amount: data.cost,
            type: 'bits',
        },
        display_name: data.displayName,
        in_development: data.inDevelopment,
        expiration: data.expirationDate,
        is_broadcast: data.broadcast,
    };
}
exports.createExtensionProductBody = createExtensionProductBody;
/** @internal */
function createExtensionTransactionQuery(extensionId, filter) {
    return {
        extension_id: extensionId,
        id: filter.transactionIds,
    };
}
exports.createExtensionTransactionQuery = createExtensionTransactionQuery;
