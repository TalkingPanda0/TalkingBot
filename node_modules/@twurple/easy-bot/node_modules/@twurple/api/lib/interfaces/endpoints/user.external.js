"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserBlockDeleteQuery = exports.createUserBlockCreateQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createUserBlockCreateQuery(target, additionalInfo) {
    return {
        target_user_id: (0, common_1.extractUserId)(target),
        source_context: additionalInfo.sourceContext,
        reason: additionalInfo.reason,
    };
}
exports.createUserBlockCreateQuery = createUserBlockCreateQuery;
/** @internal */
function createUserBlockDeleteQuery(target) {
    return {
        target_user_id: (0, common_1.extractUserId)(target),
    };
}
exports.createUserBlockDeleteQuery = createUserBlockDeleteQuery;
