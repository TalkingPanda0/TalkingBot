import { stringify } from '@d-fischer/qs';
import { HttpStatusCodeError } from "../errors/HttpStatusCodeError.mjs";
/** @private */
export async function handleTwitchApiResponseError(response, options) {
    var _a;
    if (!response.ok) {
        const isJson = response.headers.get('Content-Type') === 'application/json';
        const text = isJson ? JSON.stringify(await response.json(), null, 2) : await response.text();
        const params = stringify(options.query, { arrayFormat: 'repeat', addQueryPrefix: true });
        const fullUrl = `${options.url}${params}`;
        throw new HttpStatusCodeError(response.status, response.statusText, fullUrl, (_a = options.method) !== null && _a !== void 0 ? _a : 'GET', text, isJson);
    }
}
/** @private */
export async function transformTwitchApiResponse(response) {
    if (response.status === 204) {
        return undefined; // oof
    }
    const text = await response.text();
    if (!text) {
        return undefined; // mega oof - Twitch doesn't return a response when it should
    }
    return JSON.parse(text);
}
