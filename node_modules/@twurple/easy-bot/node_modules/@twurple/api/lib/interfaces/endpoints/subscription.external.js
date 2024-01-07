"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionCheckQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createSubscriptionCheckQuery(broadcaster, user) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        user_id: (0, common_1.extractUserId)(user),
    };
}
exports.createSubscriptionCheckQuery = createSubscriptionCheckQuery;
