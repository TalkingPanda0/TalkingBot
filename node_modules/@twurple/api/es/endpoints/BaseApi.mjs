import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
/** @private */
export class BaseApi {
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
__decorate([
    Enumerable(false)
], BaseApi.prototype, "_client", void 0);
