/** @internal */
export function createListenPacket(topics, accessToken) {
    return {
        type: 'LISTEN',
        data: {
            topics,
            auth_token: accessToken,
        },
    };
}
