/** @internal */
export function createSearchChannelsQuery(query, filter) {
    var _a;
    return {
        query,
        live_only: (_a = filter.liveOnly) === null || _a === void 0 ? void 0 : _a.toString(),
    };
}
