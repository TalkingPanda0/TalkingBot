"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApi = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
/** @private */
class BaseApi {
    /** @internal */
    constructor(client) {
        this._client = client;
    }
    /** @internal */
    _getUserContextIdWithDefault(userId) {
        var _a;
        return (_a = this._client._getUserIdFromRequestContext(userId)) !== null && _a !== void 0 ? _a : userId;
    }
}
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], BaseApi.prototype, "_client", void 0);
exports.BaseApi = BaseApi;
