/** @internal */
export function createPaginationQuery({ after, before, limit } = {}) {
    return {
        after,
        before,
        first: limit === null || limit === void 0 ? void 0 : limit.toString(),
    };
}
