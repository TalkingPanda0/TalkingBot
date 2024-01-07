"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoContextApiClient = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const BaseApiClient_1 = require("./BaseApiClient");
/** @private */
let NoContextApiClient = class NoContextApiClient extends BaseApiClient_1.BaseApiClient {
    /** @internal */
    _getUserIdFromRequestContext() {
        return null;
    }
};
NoContextApiClient = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'ApiClient')
], NoContextApiClient);
exports.NoContextApiClient = NoContextApiClient;
