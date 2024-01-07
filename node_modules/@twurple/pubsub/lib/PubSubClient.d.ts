import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { type AuthProvider } from '@twurple/auth';
import { type UserIdResolvable } from '@twurple/common';
import { type BasicPubSubClientOptions } from './BasicPubSubClient';
import { PubSubAutoModQueueMessage } from './messages/PubSubAutoModQueueMessage';
import { PubSubBitsBadgeUnlockMessage } from './messages/PubSubBitsBadgeUnlockMessage';
import { PubSubBitsMessage } from './messages/PubSubBitsMessage';
import { PubSubCustomMessage } from './messages/PubSubCustomMessage';
import { type PubSubLowTrustUserMessage, type PubSubMessage, type PubSubModActionMessage } from './messages/PubSubMessage';
import { PubSubRedemptionMessage } from './messages/PubSubRedemptionMessage';
import { PubSubSubscriptionMessage } from './messages/PubSubSubscriptionMessage';
import { PubSubUserModerationNotificationMessage } from './messages/PubSubUserModerationNotificationMessage';
import { PubSubWhisperMessage } from './messages/PubSubWhisperMessage';
import { PubSubHandler } from './PubSubHandler';
/**
 * Options for the PubSub client.
 *
 * @inheritDoc
 */
export interface PubSubClientConfig extends BasicPubSubClientOptions {
    authProvider: AuthProvider;
}
/**
 * A high level PubSub client attachable to a multiple users.
 */
export declare class PubSubClient extends EventEmitter {
    private readonly _handlers;
    private readonly _logger;
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
    readonly onListenError: import("@d-fischer/typed-event-emitter").EventBinder<[handler: PubSubHandler<PubSubMessage>, error: Error, userInitiated: boolean]>;
    /**
     * Creates a new PubSub client.
     *
     * @param config The client configuration.
     *
     * @expandParams
     */
    constructor(config: PubSubClientConfig);
    /**
     * Adds a handler to AutoMod queue events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param channel The channel to listen to.
     * @param callback A function to be called when an AutoMod queue event is sent to the user.
     *
     * It receives a {@link PubSubAutoModQueueMessage} object.
     */
    onAutoModQueue(user: UserIdResolvable, channel: UserIdResolvable, callback: (message: PubSubAutoModQueueMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to bits events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a bits event happens in the user's channel.
     *
     * It receives a {@link PubSubBitsMessage} object.
     */
    onBits(user: UserIdResolvable, callback: (message: PubSubBitsMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to bits badge unlock events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a bit badge is unlocked in the user's channel.
     *
     * It receives a {@link PubSubBitsBadgeUnlockMessage} object.
     */
    onBitsBadgeUnlock(user: UserIdResolvable, callback: (message: PubSubBitsBadgeUnlockMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to low-trust users events to the client.
     *
     * @param channel The channel the event will be subscribed for.
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a low-trust user event is sent to the user.
     */
    onLowTrustUser(channel: UserIdResolvable, user: UserIdResolvable, callback: (message: PubSubLowTrustUserMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to mod action events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param channel The channel the event will be subscribed for.
     * @param callback A function to be called when a mod action event is sent to the user.
     *
     * It can receive any kind of {@link PubSubModActionMessage} object.
     */
    onModAction(user: UserIdResolvable, channel: UserIdResolvable, callback: (message: PubSubModActionMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to redemption events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a channel point reward is redeemed in the user's channel.
     *
     * It receives a {@link PubSubRedemptionMessage} object.
     */
    onRedemption(user: UserIdResolvable, callback: (message: PubSubRedemptionMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to subscription events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a subscription event happens in the user's channel.
     *
     * It receives a {@link PubSubSubscriptionMessage} object.
     */
    onSubscription(user: UserIdResolvable, callback: (message: PubSubSubscriptionMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to user moderation events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param channel The channel to listen to.
     * @param callback A function to be called when a user moderation event is sent to the user.
     *
     * It receives a {@link PubSubUserModerationNotificationMessage} object.
     */
    onUserModeration(user: UserIdResolvable, channel: UserIdResolvable, callback: (message: PubSubUserModerationNotificationMessage) => void): PubSubHandler<never>;
    /**
     * Adds a handler to whisper events to the client.
     *
     * @param user The user the event will be subscribed for.
     * @param callback A function to be called when a whisper is sent to the user.
     *
     * It receives a {@link PubSubWhisperMessage} object.
     */
    onWhisper(user: UserIdResolvable, callback: (message: PubSubWhisperMessage) => void): PubSubHandler<never>;
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
    onCustomTopic(user: UserIdResolvable, topic: string, callback: (message: PubSubCustomMessage) => void, scope?: string, channel?: UserIdResolvable): PubSubHandler<never>;
    /**
     * Removes a handler from the client.
     *
     * @param handler A handler returned by one of the `on*` methods.
     */
    removeHandler(handler: PubSubHandler<never>): void;
    /**
     * Removes all handlers from the client.
     */
    removeAllHandlers(): void;
    private _addHandler;
    private _parseMessage;
}
//# sourceMappingURL=PubSubClient.d.ts.map