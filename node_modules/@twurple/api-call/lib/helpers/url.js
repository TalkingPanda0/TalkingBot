"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwitchApiUrl = void 0;
/** @internal */
function getTwitchApiUrl(url, type, mockServerPort) {
    switch (type) {
        case 'helix': {
            const unprefixedUrl = url.replace(/^\//, '');
            if (mockServerPort) {
                if (unprefixedUrl === 'eventsub/subscriptions') {
                    return `http://localhost:${mockServerPort}/${unprefixedUrl}`;
                }
                return `http://localhost:${mockServerPort}/mock/${unprefixedUrl}`;
            }
            return `https://api.twitch.tv/helix/${unprefixedUrl}`;
        }
        case 'auth':
            return `https://id.twitch.tv/oauth2/${url.replace(/^\//, '')}`;
        case 'custom':
            return url;
        default:
            return url; // wat
    }
}
exports.getTwitchApiUrl = getTwitchApiUrl;
