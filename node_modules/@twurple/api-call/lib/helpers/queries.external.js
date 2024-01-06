"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBroadcasterQuery = void 0;
const common_1 = require("@twurple/common");
function createBroadcasterQuery(user) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(user),
    };
}
exports.createBroadcasterQuery = createBroadcasterQuery;
