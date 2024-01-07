"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationQuery = void 0;
/** @internal */
function createPaginationQuery({ after, before, limit } = {}) {
    return {
        after,
        before,
        first: limit === null || limit === void 0 ? void 0 : limit.toString(),
    };
}
exports.createPaginationQuery = createPaginationQuery;
