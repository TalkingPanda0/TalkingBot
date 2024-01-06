"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBitsLeaderboardQuery = void 0;
/** @internal */
function createBitsLeaderboardQuery(params = {}) {
    const { count = 10, period = 'all', startDate, contextUserId } = params;
    return {
        count: count.toString(),
        period,
        started_at: startDate === null || startDate === void 0 ? void 0 : startDate.toISOString(),
        user_id: contextUserId,
    };
}
exports.createBitsLeaderboardQuery = createBitsLeaderboardQuery;
