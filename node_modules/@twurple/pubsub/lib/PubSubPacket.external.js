"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListenPacket = void 0;
/** @internal */
function createListenPacket(topics, accessToken) {
    return {
        type: 'LISTEN',
        data: {
            topics,
            auth_token: accessToken,
        },
    };
}
exports.createListenPacket = createListenPacket;
