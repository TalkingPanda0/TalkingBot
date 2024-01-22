"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubWsSocket = void 0;
const tslib_1 = require("tslib");
const connection_1 = require("@d-fischer/connection");
const logger_1 = require("@d-fischer/logger");
const shared_utils_1 = require("@d-fischer/shared-utils");
/** @internal */
class EventSubWsSocket {
    constructor(_listener, _userId, initialUrl, loggerOptions) {
        this._listener = _listener;
        this._userId = _userId;
        this._reconnectInProgress = false;
        this._readyToSubscribe = false;
        this._logger = (0, logger_1.createLogger)({
            name: `twurple:eventsub:ws:${_userId}`,
            ...loggerOptions,
        });
        this._initialUrl = initialUrl;
        this._keepaliveTimeout = null;
        this._keepaliveTimer = null;
        this._connection = new connection_1.PersistentConnection(connection_1.WebSocketConnection, () => {
            var _a;
            return ({
                url: (_a = this._reconnectUrl) !== null && _a !== void 0 ? _a : this._initialUrl,
            });
        }, {
            overlapManualReconnect: true,
        });
        this._connection.onConnect(() => {
            this._listener._notifySocketConnect(this);
        });
        this._connection.onDisconnect((_, e) => {
            this._listener._notifySocketDisconnect(this, e);
            this._readyToSubscribe = false;
            this._clearKeepaliveTimer();
            this._keepaliveTimeout = null;
            for (const sub of this._listener._getSubscriptionsForUser(this._userId)) {
                sub._droppedByTwitch();
            }
        });
        this._connection.onReceive(data => {
            this._logger.debug(`Received data: ${data.trim()}`);
            const { metadata, payload } = JSON.parse(data);
            switch (metadata.message_type) {
                case 'session_welcome': {
                    this._logger.info(this._reconnectInProgress ? 'Reconnect: new connection established' : 'Connection established');
                    this._sessionId = payload.session.id;
                    this._readyToSubscribe = true;
                    if (!this._reconnectInProgress) {
                        const subs = this._listener._getSubscriptionsForUser(this._userId);
                        if (!subs.length) {
                            this._logger.debug(`Stopping socket for user ${this._userId} because no subscriptions are active`);
                            this.stop();
                            break;
                        }
                        for (const sub of subs) {
                            sub.start();
                        }
                    }
                    this._initializeKeepaliveTimeout(payload.session.keepalive_timeout_seconds);
                    this._reconnectInProgress = false;
                    this._connection.acknowledgeSuccessfulReconnect();
                    break;
                }
                case 'session_keepalive': {
                    this._restartKeepaliveTimer();
                    break;
                }
                case 'session_reconnect': {
                    this._logger.info('Reconnect message received; initiating new connection');
                    this._reconnectInProgress = true;
                    this._reconnectUrl = payload.session.reconnect_url;
                    this._connection.reconnect();
                    break;
                }
                case 'notification': {
                    this._restartKeepaliveTimer();
                    const { id } = payload.subscription;
                    const subscription = this._listener._getCorrectSubscriptionByTwitchId(id);
                    if (!subscription) {
                        this._logger.error(`Notification from unknown event received: ${id}`);
                        break;
                    }
                    const notificationPayload = payload;
                    if ('events' in notificationPayload) {
                        for (const event of notificationPayload.events) {
                            subscription._handleData(event.data);
                        }
                    }
                    else {
                        subscription._handleData(notificationPayload.event);
                    }
                    break;
                }
                case 'revocation': {
                    const { id } = payload.subscription;
                    const subscription = this._listener._getCorrectSubscriptionByTwitchId(id);
                    if (!subscription) {
                        this._logger.error(`Revocation from unknown event received: ${id}`);
                        break;
                    }
                    this._listener._dropSubscription(subscription.id);
                    this._listener._dropTwitchSubscription(subscription.id);
                    this._listener._handleSubscriptionRevoke(subscription);
                    this._logger.debug(`Subscription revoked by Twitch for event: ${id}`);
                    break;
                }
                default: {
                    this._logger.warn(`Unknown message type encountered: ${metadata.message_type}`);
                }
            }
        });
    }
    start() {
        if (!this._connection.isConnected && !this._connection.isConnecting) {
            this._connection.connect();
        }
    }
    stop() {
        if (this._connection.isConnected || this._connection.isConnecting) {
            this._connection.disconnect();
        }
    }
    get readyToSubscribe() {
        return this._readyToSubscribe;
    }
    get sessionId() {
        return this._sessionId;
    }
    get userId() {
        return this._userId;
    }
    _initializeKeepaliveTimeout(timeoutInSeconds) {
        this._keepaliveTimeout = timeoutInSeconds;
        this._restartKeepaliveTimer();
    }
    _clearKeepaliveTimer() {
        if (this._keepaliveTimer) {
            clearTimeout(this._keepaliveTimer);
            this._keepaliveTimer = null;
        }
    }
    _restartKeepaliveTimer() {
        this._clearKeepaliveTimer();
        if (this._keepaliveTimeout) {
            // 1200 instead of 1000 to allow for a little more leeway than Twitch wants to give us
            this._keepaliveTimer = setTimeout(() => this._handleKeepaliveTimeout(), this._keepaliveTimeout * 1200);
        }
    }
    _handleKeepaliveTimeout() {
        this._keepaliveTimer = null;
        this._connection.assumeExternalDisconnect();
    }
}
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubWsSocket.prototype, "_connection", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubWsSocket.prototype, "_sessionId", void 0);
exports.EventSubWsSocket = EventSubWsSocket;
