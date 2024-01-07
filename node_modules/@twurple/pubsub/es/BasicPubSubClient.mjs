var BasicPubSubClient_1;
import { __decorate } from "tslib";
import { PersistentConnection, WebSocketConnection, } from '@d-fischer/connection';
import { createLogger } from '@d-fischer/logger';
import { Enumerable, promiseWithResolvers } from '@d-fischer/shared-utils';
import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { getValidTokenFromProviderForUser } from '@twurple/auth';
import { HellFreezesOverError, rtfm } from '@twurple/common';
import { createListenPacket, } from "./PubSubPacket.external.mjs";
/**
 * A client for the Twitch PubSub interface.
 */
let BasicPubSubClient = BasicPubSubClient_1 = class BasicPubSubClient extends EventEmitter {
    /**
     * Creates a new PubSub client.
     *
     * @param options
     *
     * @expandParams
     */
    constructor(options) {
        super();
        // topic => token
        /** @internal */ this._topics = new Map();
        this._pingOnActivity = 240;
        this._pingOnInactivity = 60;
        this._pingTimeout = 10;
        this._onPong = this.registerInternalEvent();
        this._onResponse = this.registerInternalEvent();
        /**
         * Fires when a message that matches your listening topics is received.
         *
         * @eventListener
         *
         * @param topic The name of the topic.
         * @param message The message data.
         */
        this.onMessage = this.registerEvent();
        /**
         * Fires when listening to a topic fails.
         *
         * @eventListener
         *
         * @param topic The name of the topic.
         * @param error The error.
         * @param userInitiated Whether the listen was directly initiated by a user.
         *
         * The other case would happen in cases like re-sending listen packets after a reconnect.
         */
        this.onListenError = this.registerEvent();
        /**
         * Fires when the client finishes establishing a connection to the PubSub server.
         *
         * @eventListener
         */
        this.onConnect = this.registerEvent();
        /**
         * Fires when the client closes its connection to the PubSub server.
         *
         * @eventListener
         * @param isError Whether the cause of the disconnection was an error. A reconnect will be attempted if this is true.
         * @param reason The error object.
         */
        this.onDisconnect = this.registerEvent();
        /**
         * Fires when the client receives a pong message from the PubSub server.
         *
         * @eventListener
         * @param latency The current latency to the server, in milliseconds.
         * @param requestTimestampe The time the ping request was sent to the PubSub server.
         */
        this.onPong = this.registerEvent();
        this._logger = createLogger({
            name: 'twurple:pubsub:basic',
            ...options === null || options === void 0 ? void 0 : options.logger,
        });
        this._connection = new PersistentConnection(WebSocketConnection, { hostName: 'pubsub-edge.twitch.tv', port: 443, secure: true }, { logger: this._logger, additionalOptions: { wsOptions: options === null || options === void 0 ? void 0 : options.wsOptions } });
        this._connection.onConnect(async () => {
            this._logger.info('Connection established');
            this._pingCheck();
            this._startActivityPingCheckTimer();
            this._startInactivityPingCheckTimer();
            this._resendListens();
            if (this._topics.size) {
                this._logger.info('Listened to previously registered topics');
                this._logger.debug(`Previously registered topics: ${Array.from(this._topics.keys()).join(', ')}`);
            }
            this.emit(this.onConnect);
        });
        this._connection.onReceive((line) => {
            this._receiveMessage(line.trim());
            this._startInactivityPingCheckTimer();
        });
        this._connection.onDisconnect((manually, reason) => {
            clearInterval(this._activityPingCheckTimer);
            clearInterval(this._inactivityPingCheckTimer);
            clearTimeout(this._pingTimeoutTimer);
            this.removeInternalListener();
            if (manually) {
                this._logger.info('Disconnected');
            }
            else if (reason) {
                this._logger.error(`Disconnected unexpectedly: ${reason.message}`);
            }
            else {
                this._logger.error('Disconnected unexpectedly');
            }
            this.emit(this.onDisconnect, manually, reason);
        });
    }
    /**
     * Listens to one or more topics.
     *
     * @param topics A topic or a list of topics to listen to.
     * @param tokenResolvable An access token, an AuthProvider or a function that returns a token.
     */
    listen(topics, tokenResolvable) {
        const topicsArray = typeof topics === 'string' ? [topics] : topics;
        const wrapped = BasicPubSubClient_1._wrapResolvable(tokenResolvable);
        for (const topic of topicsArray) {
            this._topics.set(topic, wrapped);
        }
        if (this.isConnected) {
            this._resolveToken(wrapped)
                .then(async (token) => await this._sendListen(topicsArray, token))
                .catch(e => {
                for (const topic of topicsArray) {
                    this.emit(this.onListenError, topic, e, true);
                }
            });
        }
    }
    /**
     * Removes one or more topics from the listener.
     *
     * @param topics A topic or a list of topics to not listen to anymore.
     */
    unlisten(topics) {
        const topicsArray = typeof topics === 'string' ? [topics] : topics;
        for (const topic of topics) {
            this._topics.delete(topic);
        }
        if (this.isConnected) {
            this._sendUnlisten(topicsArray).catch(e => {
                var _a;
                this._logger.error(`Error during unlisten of topics ${topicsArray.join(', ')}: ${(_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e}`);
            });
        }
    }
    /**
     * Connects to the PubSub interface.
     */
    connect() {
        if (!this._connection.isConnected && !this._connection.isConnecting) {
            this._logger.info('Connecting...');
            this._connection.connect();
        }
    }
    /**
     * Disconnects from the PubSub interface.
     */
    disconnect() {
        this._logger.info('Disconnecting...');
        this._connection.disconnect();
    }
    /**
     * Reconnects to the PubSub interface.
     */
    reconnect() {
        this.disconnect();
        this.connect();
    }
    /**
     * Checks whether the client is currently connecting to the server.
     */
    get isConnecting() {
        return this._connection.isConnecting;
    }
    /**
     * Checks whether the client is currently connected to the server.
     */
    get isConnected() {
        return this._connection.isConnected;
    }
    /** @private */
    get hasAnyTopics() {
        return this._topics.size > 0;
    }
    async _sendListen(topics, accessToken) {
        await this._sendNonced(createListenPacket(topics, accessToken));
    }
    async _sendUnlisten(topics) {
        await this._sendNonced({
            type: 'UNLISTEN',
            data: {
                topics,
            },
        });
    }
    static _wrapResolvable(resolvable) {
        switch (typeof resolvable) {
            case 'object': {
                return resolvable;
            }
            case 'string': {
                return {
                    type: 'static',
                    token: resolvable,
                };
            }
            case 'function': {
                return {
                    type: 'function',
                    function: resolvable,
                };
            }
            default: {
                throw new HellFreezesOverError(`Passed unknown type to wrapResolvable: ${typeof resolvable}`);
            }
        }
    }
    async _resolveToken(resolvable) {
        switch (resolvable.type) {
            case 'provider': {
                const { provider, scopes, userId } = resolvable;
                const { accessToken } = await getValidTokenFromProviderForUser(provider, userId, scopes, this._logger);
                return accessToken.accessToken;
            }
            case 'function': {
                return await resolvable.function();
            }
            case 'static': {
                return resolvable.token;
            }
            default: {
                throw new HellFreezesOverError(`Passed unknown type to resolveToken: ${resolvable.type}`);
            }
        }
    }
    _resendListens() {
        const topicsByTokenResolvable = new Map();
        for (const [topic, tokenResolvable] of this._topics) {
            if (topicsByTokenResolvable.has(tokenResolvable)) {
                topicsByTokenResolvable.get(tokenResolvable).push(topic);
            }
            else {
                topicsByTokenResolvable.set(tokenResolvable, [topic]);
            }
        }
        void Array.from(topicsByTokenResolvable)
            .reduce(
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        (chain, [tokenResolvable, topics]) => 
        // eslint-disable-next-line @typescript-eslint/return-await
        chain.then(async (topicsByToken) => {
            const token = await this._resolveToken(tokenResolvable);
            if (topicsByToken.has(token)) {
                topicsByToken.get(token).push(...topics);
            }
            else {
                topicsByToken.set(token, topics);
            }
            return topicsByToken;
        }), Promise.resolve(new Map()))
            .then(topicsByToken => {
            for (const [token, topics] of topicsByToken) {
                this._sendListen(topics, token).catch(e => {
                    for (const topic of topics) {
                        this.emit(this.onListenError, topic, e, false);
                    }
                });
            }
        });
    }
    async _sendNonced(packet) {
        const { promise, resolve, reject } = promiseWithResolvers();
        const nonce = Math.random().toString(16).slice(2);
        const responseListener = this._onResponse((recvNonce, error) => {
            if (recvNonce === nonce) {
                if (error) {
                    reject(new Error(`Error sending nonced ${packet.type} packet: ${error}`));
                }
                else {
                    resolve();
                }
                responseListener.unbind();
            }
        });
        packet.nonce = nonce;
        this._sendPacket(packet);
        await promise;
    }
    _receiveMessage(dataStr) {
        this._logger.debug(`Received message: ${dataStr}`);
        const data = JSON.parse(dataStr);
        switch (data.type) {
            case 'PONG': {
                this.emit(this._onPong);
                break;
            }
            case 'RECONNECT': {
                this.reconnect();
                break;
            }
            case 'RESPONSE': {
                this.emit(this._onResponse, data.nonce, data.error);
                break;
            }
            case 'MESSAGE': {
                this.emit(this.onMessage, data.data.topic, JSON.parse(data.data.message));
                break;
            }
            default: {
                this._logger.warn(`PubSub connection received unexpected message type: ${data.type}`);
            }
        }
    }
    _sendPacket(data) {
        const dataStr = JSON.stringify(data);
        this._logger.debug(`Sending message: ${dataStr}`);
        this._connection.sendLine(dataStr);
    }
    _pingCheck() {
        const pingTime = Date.now();
        this._onPong(() => {
            const latency = Date.now() - pingTime;
            this.emit(this.onPong, latency, pingTime);
            this._logger.info(`Current latency: ${latency}ms`);
            if (this._pingTimeoutTimer) {
                clearTimeout(this._pingTimeoutTimer);
            }
            this.removeInternalListener(this._onPong);
        });
        this._pingTimeoutTimer = setTimeout(async () => {
            this._logger.error('Ping timeout');
            this.removeInternalListener(this._onPong);
            this._connection.assumeExternalDisconnect();
        }, this._pingTimeout * 1000);
        this._sendPacket({ type: 'PING' });
    }
    _startActivityPingCheckTimer() {
        clearInterval(this._activityPingCheckTimer);
        if (this._connection.isConnected) {
            this._activityPingCheckTimer = setInterval(() => {
                this._startInactivityPingCheckTimer();
                this._pingCheck();
            }, this._pingOnActivity * 1000);
        }
        else {
            this._activityPingCheckTimer = undefined;
        }
    }
    _startInactivityPingCheckTimer() {
        clearInterval(this._inactivityPingCheckTimer);
        if (this._connection.isConnected) {
            this._inactivityPingCheckTimer = setInterval(() => {
                this._startActivityPingCheckTimer();
                this._pingCheck();
            }, this._pingOnInactivity * 1000);
        }
        else {
            this._inactivityPingCheckTimer = undefined;
        }
    }
};
__decorate([
    Enumerable(false)
], BasicPubSubClient.prototype, "_logger", void 0);
__decorate([
    Enumerable(false)
], BasicPubSubClient.prototype, "_topics", void 0);
BasicPubSubClient = BasicPubSubClient_1 = __decorate([
    rtfm('pubsub', 'BasicPubSubClient')
], BasicPubSubClient);
export { BasicPubSubClient };
