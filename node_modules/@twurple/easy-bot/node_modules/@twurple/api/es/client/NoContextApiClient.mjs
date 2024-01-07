import { __decorate } from "tslib";
import { rtfm } from '@twurple/common';
import { BaseApiClient } from "./BaseApiClient.mjs";
/** @private */
let NoContextApiClient = class NoContextApiClient extends BaseApiClient {
    /** @internal */
    _getUserIdFromRequestContext() {
        return null;
    }
};
NoContextApiClient = __decorate([
    rtfm('api', 'ApiClient')
], NoContextApiClient);
export { NoContextApiClient };
