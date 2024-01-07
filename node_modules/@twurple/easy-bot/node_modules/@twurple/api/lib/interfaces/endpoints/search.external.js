"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchChannelsQuery = void 0;
/** @internal */
function createSearchChannelsQuery(query, filter) {
    var _a;
    return {
        query,
        live_only: (_a = filter.liveOnly) === null || _a === void 0 ? void 0 : _a.toString(),
    };
}
exports.createSearchChannelsQuery = createSearchChannelsQuery;
