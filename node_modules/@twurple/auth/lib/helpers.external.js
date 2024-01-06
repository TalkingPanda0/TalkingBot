"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeTokenQuery = exports.createRefreshTokenQuery = exports.createGetAppTokenQuery = exports.createExchangeCodeQuery = void 0;
/** @internal */
function createExchangeCodeQuery(clientId, clientSecret, code, redirectUri) {
    return {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
    };
}
exports.createExchangeCodeQuery = createExchangeCodeQuery;
/** @internal */
function createGetAppTokenQuery(clientId, clientSecret) {
    return {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
    };
}
exports.createGetAppTokenQuery = createGetAppTokenQuery;
/** @internal */
function createRefreshTokenQuery(clientId, clientSecret, refreshToken) {
    return {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
    };
}
exports.createRefreshTokenQuery = createRefreshTokenQuery;
/** @internal */
function createRevokeTokenQuery(clientId, accessToken) {
    return {
        client_id: clientId,
        token: accessToken,
    };
}
exports.createRevokeTokenQuery = createRevokeTokenQuery;
