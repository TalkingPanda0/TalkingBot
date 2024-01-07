"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDropsEntitlementUpdateBody = exports.createDropsEntitlementQuery = void 0;
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/** @internal */
function createDropsEntitlementQuery(filters, alwaysApp) {
    return {
        user_id: alwaysApp ? (0, shared_utils_1.mapOptional)(filters.user, common_1.extractUserId) : undefined,
        game_id: filters.gameId,
        fulfillment_status: filters.fulfillmentStatus,
    };
}
exports.createDropsEntitlementQuery = createDropsEntitlementQuery;
/** @internal */
function createDropsEntitlementUpdateBody(ids, fulfillmentStatus) {
    return {
        fulfillment_status: fulfillmentStatus,
        entitlement_ids: ids,
    };
}
exports.createDropsEntitlementUpdateBody = createDropsEntitlementUpdateBody;
