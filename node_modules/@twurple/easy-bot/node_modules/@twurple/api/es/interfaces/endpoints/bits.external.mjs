/** @internal */
export function createBitsLeaderboardQuery(params = {}) {
    const { count = 10, period = 'all', startDate, contextUserId } = params;
    return {
        count: count.toString(),
        period,
        started_at: startDate === null || startDate === void 0 ? void 0 : startDate.toISOString(),
        user_id: contextUserId,
    };
}
