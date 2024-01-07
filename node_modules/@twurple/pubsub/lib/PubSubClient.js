"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubClient = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@d-fischer/logger");
const shared_utils_1 = require("@d-fischer/shared-utils");
const typed_event_emitter_1 = require("@d-fischer/typed-event-emitter");
const common_1 = require("@twurple/common");
const BasicPubSubClient_1 = require("./BasicPubSubClient");
const PubSubAutoModQueueMessage_1 = require("./messages/PubSubAutoModQueueMessage");
const PubSubBitsBadgeUnlockMessage_1 = require("./messages/PubSubBitsBadgeUnlockMessage");
const PubSubBitsMessage_1 = require("./messages/PubSubBitsMessage");
const PubSubChannelRoleChangeMessage_1 = require("./messages/PubSubChannelRoleChangeMessage");
const PubSubChannelTermsActionMessage_1 = require("./messages/PubSubChannelTermsActionMessage");
const PubSubChatModActionMessage_1 = require("./messages/PubSubChatModActionMessage");
const PubSubCustomMessage_1 = require("./messages/PubSubCustomMessage");
const PubSubLowTrustUserChatMessage_1 = require("./messages/PubSubLowTrustUserChatMessage");
const PubSubLowTrustUserTreatmentMessage_1 = require("./messages/PubSubLowTrustUserTreatmentMessage");
const PubSubRedemptionMessage_1 = require("./messages/PubSubRedemptionMessage");
const PubSubSubscriptionMessage_1 = require("./messages/PubSubSubscriptionMessage");
const PubSubUnbanRequestMessage_1 = require("./messages/PubSubUnbanRequestMessage");
const PubSubUserModerationNotificationMessage_1 = require("./messages/PubSubUserModerationNotificationMessage");
const PubSubWhisperMessage_1 = require("./messages/PubSubWhisperMessage");
const PubSubHandler_1 = require("./PubSubHandler");
/**
 * A high level PubSub client attachable to a multiple users.
 */
let PubSubClient = class PubSubClient extends typed_event_emitter_1.EventEmitter {
    /**
     * Creates a new PubSub client.
     *
     * @param config The client configuration.
     *
     * @expandParams
     */
    constructor(config) {
        super();
        this._handlers = new Map();
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
        this._authProvider = config.authProvider;
        this._logger = (0, logger_1.createLogger)({
            name: 'twurple:pubsub',
            ...config.logger,
        });
        this._basicClient = new BasicPubSubClient_1.BasicPubSubClient(config);
        this._basicClient.onMessage((topic, messageData) => {
            if (this._handlers.has(topic)) {
                const [type, , ...args] = topic.split('.');
                const message = this._parseMessage(type, args, messageData);
                if (message) {
                    for (const handler of this._handlers.get(topic)) {
                        handler.call(message);
                    }
                }
            }
        });
        this._basicClient.onListenError((topic, error, userInitiated) => {
            const handlers = this._handlers.get(topic);
            if (handlers) {
                for (const handler of handlers) {
                    handler.remove();
                    this.emit(this.onListenError, handler, error, userInitiated);
                }
            }
        });
    }
    /**
     * Adds a handler to AutoMod queue events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param channel The channel to listen to.
     * @param callback A function to be called when an AutoMod queue event is sent to the user.
     *
     * It receives a {@link PubSubAutoModQueueMessage} object.
     */
    onAutoModQueue(user, channel, callback) {
        return this._addHandler('automod-queue', callback, user, 'channel:moderate', (0, common_1.extractUserId)(channel));
    }
    /**
     * Adds a handler to bits events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a bits event happens in the user's channel.
     *
     * It receives a {@link PubSubBitsMessage} object.
     */
    onBits(user, callback) {
        return this._addHandler('channel-bits-events-v2', callback, user, 'bits:read');
    }
    /**
     * Adds a handler to bits badge unlock events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a bit badge is unlocked in the user's channel.
     *
     * It receives a {@link PubSubBitsBadgeUnlockMessage} object.
     */
    onBitsBadgeUnlock(user, callback) {
        return this._addHandler('channel-bits-badge-unlocks', callback, user, 'bits:read');
    }
    /**
     * Adds a handler to low-trust users events to the client.
     *
     * @param channel The channel the event will be subscribed for.
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a low-trust user event is sent to the user.
     */
    onLowTrustUser(channel, user, callback) {
        return this._addHandler('low-trust-users', callback, channel, 'channel:moderate', (0, common_1.extractUserId)(user));
    }
    /**
     * Adds a handler to mod action events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param channel The channel the event will be subscribed for.
     * @param callback A function to be called when a mod action event is sent to the user.
     *
     * It can receive any kind of {@link PubSubModActionMessage} object.
     */
    onModAction(user, channel, callback) {
        return this._addHandler('chat_moderator_actions', callback, user, 'channel:moderate', (0, common_1.extractUserId)(channel));
    }
    /**
     * Adds a handler to redemption events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a channel point reward is redeemed in the user's channel.
     *
     * It receives a {@link PubSubRedemptionMessage} object.
     */
    onRedemption(user, callback) {
        return this._addHandler('channel-points-channel-v1', callback, user, 'channel:read:redemptions');
    }
    /**
     * Adds a handler to subscription events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a subscription event happens in the user's channel.
     *
     * It receives a {@link PubSubSubscriptionMessage} object.
     */
    onSubscription(user, callback) {
        return this._addHandler('channel-subscribe-events-v1', callback, user, 'channel:read:subscriptions');
    }
    /**
     * Adds a handler to user moderation events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param channel The channel to listen to.
     * @param callback A function to be called when a user moderation event is sent to the user.
     *
     * It receives a {@link PubSubUserModerationNotificationMessage} object.
     */
    onUserModeration(user, channel, callback) {
        return this._addHandler('user-moderation-notifications', callback, user, 'chat:read', (0, common_1.extractUserId)(channel));
    }
    /**
     * Adds a handler to whisper events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a whisper is sent to the user.
     *
     * It receives a {@link PubSubWhisperMessage} object.
     */
    onWhisper(user, callback) {
        return this._addHandler('whispers', callback, user, 'whispers:read');
    }
    /**
     * Adds a handler for arbitrary/undocumented events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param topic The topic to subscribe to.
     * @param callback A function to be called when a custom event is sent to the user.
     *
     * It receives a {@link PubSubCustomMessage} object.
     * @param scope An optional scope if the topic requires it.
     * @param channel An optional second userId if the topic requires it, usually a channel.
     */
    onCustomTopic(user, topic, callback, scope, channel) {
        if (channel) {
            return this._addHandler(topic, callback, user, scope, (0, common_1.extractUserId)(channel));
        }
        return this._addHandler(topic, callback, user, scope);
    }
    /**
     * Removes a handler from the client.
     *
     * @param handler A handler returned by one of the `on*` methods.
     */
    removeHandler(handler) {
        if (this._handlers.has(handler.topic)) {
            const newHandlers = this._handlers.get(handler.topic).filter(l => l !== handler);
            if (newHandlers.length === 0) {
                this._handlers.delete(handler.topic);
                this._basicClient.unlisten(`${handler.topic}.${handler.userId}`);
                if (!this._basicClient.hasAnyTopics &&
                    (this._basicClient.isConnected || this._basicClient.isConnecting)) {
                    this._basicClient.disconnect();
                }
            }
            else {
                this._handlers.set(handler.topic, newHandlers);
            }
        }
    }
    /**
     * Removes all handlers from the client.
     */
    removeAllHandlers() {
        for (const handlers of this._handlers.values()) {
            for (const handler of handlers) {
                this.removeHandler(handler);
            }
        }
    }
    _addHandler(type, callback, user, scope, ...additionalParams) {
        this._basicClient.connect();
        const userId = (0, common_1.extractUserId)(user);
        const topicName = [type, userId, ...additionalParams].join('.');
        const handler = new PubSubHandler_1.PubSubHandler(topicName, userId, callback, this);
        if (this._handlers.has(topicName)) {
            this._handlers.get(topicName).push(handler);
        }
        else {
            this._handlers.set(topicName, [handler]);
            this._basicClient.listen(topicName, {
                type: 'provider',
                provider: this._authProvider,
                scopes: scope ? [scope] : [],
                userId,
            });
        }
        return handler;
    }
    _parseMessage(type, args, messageData) {
        switch (type) {
            case 'automod-queue': {
                return new PubSubAutoModQueueMessage_1.PubSubAutoModQueueMessage(messageData, args[0]);
            }
            case 'channel-bits-events-v2': {
                return new PubSubBitsMessage_1.PubSubBitsMessage(messageData);
            }
            case 'channel-bits-badge-unlocks': {
                return new PubSubBitsBadgeUnlockMessage_1.PubSubBitsBadgeUnlockMessage(messageData);
            }
            case 'channel-points-channel-v1': {
                return new PubSubRedemptionMessage_1.PubSubRedemptionMessage(messageData);
            }
            case 'channel-subscribe-events-v1': {
                return new PubSubSubscriptionMessage_1.PubSubSubscriptionMessage(messageData);
            }
            case 'chat_moderator_actions': {
                const data = messageData;
                switch (data.type) {
                    case 'moderation_action': {
                        return new PubSubChatModActionMessage_1.PubSubChatModActionMessage(data, args[0]);
                    }
                    case 'channel_terms_action': {
                        return new PubSubChannelTermsActionMessage_1.PubSubChannelTermsActionMessage(data, args[0]);
                    }
                    case 'approve_unban_request':
                    case 'deny_unban_request': {
                        return new PubSubUnbanRequestMessage_1.PubSubUnbanRequestMessage(data, args[0]);
                    }
                    case 'moderator_added':
                    case 'moderator_removed':
                    case 'vip_added':
                    case 'vip_removed': {
                        return new PubSubChannelRoleChangeMessage_1.PubSubChannelRoleChangeMessage(data, args[0]);
                    }
                    default: {
                        this._logger
                            .error(`Unknown moderator action received; please open an issue with the following info (redact IDs and names if you want):
Type: ${data.type}
Data: ${JSON.stringify(data, undefined, 2)}`);
                        return undefined;
                    }
                }
            }
            case 'low-trust-users': {
                const data = messageData;
                switch (data.type) {
                    case 'low_trust_user_new_message': {
                        return new PubSubLowTrustUserChatMessage_1.PubSubLowTrustUserChatMessage(data);
                    }
                    case 'low_trust_user_treatment_update': {
                        return new PubSubLowTrustUserTreatmentMessage_1.PubSubLowTrustUserTreatmentMessage(data);
                    }
                    default: {
                        this._logger
                            .error(`Unknown low-trust users event received; please open an issue with the following info (redact IDs and names if you want):
Type: ${data.type}
Data: ${JSON.stringify(data, undefined, 2)}`);
                        return undefined;
                    }
                }
            }
            case 'user-moderation-notifications': {
                return new PubSubUserModerationNotificationMessage_1.PubSubUserModerationNotificationMessage(messageData, args[0]);
            }
            case 'whispers': {
                return new PubSubWhisperMessage_1.PubSubWhisperMessage(messageData);
            }
            default:
                return new PubSubCustomMessage_1.PubSubCustomMessage(messageData);
        }
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], PubSubClient.prototype, "_authProvider", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], PubSubClient.prototype, "_basicClient", void 0);
PubSubClient = tslib_1.__decorate([
    (0, common_1.rtfm)('pubsub', 'PubSubClient')
], PubSubClient);
exports.PubSubClient = PubSubClient;
