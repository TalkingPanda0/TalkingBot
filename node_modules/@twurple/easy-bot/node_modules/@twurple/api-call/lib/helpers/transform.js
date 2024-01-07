"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformTwitchApiResponse = exports.handleTwitchApiResponseError = void 0;
const qs_1 = require("@d-fischer/qs");
const HttpStatusCodeError_1 = require("../errors/HttpStatusCodeError");
/** @private */
async function handleTwitchApiResponseError(response, options) {
    var _a;
    if (!response.ok) {
        const isJson = response.headers.get('Content-Type') === 'application/json';
        const text = isJson ? JSON.stringify(await response.json(), null, 2) : await response.text();
        const params = (0, qs_1.stringify)(options.query, { arrayFormat: 'repeat', addQueryPrefix: true });
        const fullUrl = `${options.url}${params}`;
        throw new HttpStatusCodeError_1.HttpStatusCodeError(response.status, response.statusText, fullUrl, (_a = options.method) !== null && _a !== void 0 ? _a : 'GET', text, isJson);
    }
}
exports.handleTwitchApiResponseError = handleTwitchApiResponseError;
/** @private */
async function transformTwitchApiResponse(response) {
    if (response.status === 204) {
        return undefined; // oof
    }
    const text = await response.text();
    if (!text) {
        return undefined; // mega oof - Twitch doesn't return a response when it should
    }
    return JSON.parse(text);
}
exports.transformTwitchApiResponse = transformTwitchApiResponse;
