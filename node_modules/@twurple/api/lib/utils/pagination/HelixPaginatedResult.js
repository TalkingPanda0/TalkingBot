"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResultWithTotal = exports.createPaginatedResult = void 0;
/** @internal */ function createPaginatedResult(response, type, client) {
    var _a;
    let dataCache = undefined;
    return {
        get data() {
            var _a, _b;
            return (dataCache !== null && dataCache !== void 0 ? dataCache : (dataCache = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.map(data => new type(data, client))) !== null && _b !== void 0 ? _b : []));
        },
        cursor: typeof response.pagination === 'string' ? response.pagination : (_a = response.pagination) === null || _a === void 0 ? void 0 : _a.cursor,
    };
}
exports.createPaginatedResult = createPaginatedResult;
/** @internal */ function createPaginatedResultWithTotal(response, type, client) {
    let dataCache = undefined;
    return {
        get data() {
            var _a, _b;
            return (dataCache !== null && dataCache !== void 0 ? dataCache : (dataCache = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.map(data => new type(data, client))) !== null && _b !== void 0 ? _b : []));
        },
        cursor: response.pagination.cursor,
        total: response.total,
    };
}
exports.createPaginatedResultWithTotal = createPaginatedResultWithTotal;
