"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callTwitchApi = exports.callTwitchApiRaw = void 0;
const cross_fetch_1 = require("@d-fischer/cross-fetch");
const qs_1 = require("@d-fischer/qs");
const transform_1 = require("./helpers/transform");
const url_1 = require("./helpers/url");
/**
 * Makes a call to the Twitch API using the given credentials, returning the raw Response object.
 *
 * @param options The configuration of the call.
 * @param clientId The client ID of your application.
 * @param accessToken The access token to call the API with.
 *
 * You need to obtain one using one of the [Twitch OAuth flows](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
 * @param authorizationType The type of Authorization header to send.
 *
 * Defaults to "Bearer" for Helix and "OAuth" for everything else.
 * @param fetchOptions Additional options to be passed to the `fetch` function.
 * @param mockServerPort
 */
async function callTwitchApiRaw(options, clientId, accessToken, authorizationType, fetchOptions = {}, mockServerPort) {
    var _a, _b;
    const type = (_a = options.type) !== null && _a !== void 0 ? _a : 'helix';
    const url = (0, url_1.getTwitchApiUrl)(options.url, type, mockServerPort);
    const params = (0, qs_1.stringify)(options.query, { arrayFormat: 'repeat', addQueryPrefix: true });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers = new cross_fetch_1.Headers({ Accept: 'application/json' });
    let body = undefined;
    if (options.jsonBody) {
        body = JSON.stringify(options.jsonBody);
        headers.append('Content-Type', 'application/json');
    }
    if (clientId && type !== 'auth') {
        headers.append('Client-ID', clientId);
    }
    if (accessToken) {
        headers.append('Authorization', `${type === 'helix' ? authorizationType !== null && authorizationType !== void 0 ? authorizationType : 'Bearer' : 'OAuth'} ${accessToken}`);
    }
    const requestOptions = {
        ...fetchOptions,
        method: (_b = options.method) !== null && _b !== void 0 ? _b : 'GET',
        headers,
        body,
    };
    return await (0, cross_fetch_1.default)(`${url}${params}`, requestOptions);
}
exports.callTwitchApiRaw = callTwitchApiRaw;
/**
 * Makes a call to the Twitch API using given credentials.
 *
 * @param options The configuration of the call.
 * @param clientId The client ID of your application.
 * @param accessToken The access token to call the API with.
 *
 * You need to obtain one using one of the [Twitch OAuth flows](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
 * @param authorizationType The type of Authorization header to send.
 *
 * Defaults to "Bearer" for Helix and "OAuth" for everything else.
 * @param fetchOptions Additional options to be passed to the `fetch` function.
 */
async function callTwitchApi(options, clientId, accessToken, authorizationType, fetchOptions = {}) {
    const response = await callTwitchApiRaw(options, clientId, accessToken, authorizationType, fetchOptions);
    await (0, transform_1.handleTwitchApiResponseError)(response, options);
    return await (0, transform_1.transformTwitchApiResponse)(response);
}
exports.callTwitchApi = callTwitchApi;
