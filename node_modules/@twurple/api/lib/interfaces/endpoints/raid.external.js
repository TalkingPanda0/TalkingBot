"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRaidStartQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createRaidStartQuery(from, to) {
    return {
        from_broadcaster_id: (0, common_1.extractUserId)(from),
        to_broadcaster_id: (0, common_1.extractUserId)(to),
    };
}
exports.createRaidStartQuery = createRaidStartQuery;
