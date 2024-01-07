"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWhisperQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createWhisperQuery(from, to) {
    return {
        from_user_id: (0, common_1.extractUserId)(from),
        to_user_id: (0, common_1.extractUserId)(to),
    };
}
exports.createWhisperQuery = createWhisperQuery;
