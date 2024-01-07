/// <reference types="ws" />
import { type WebSocketClientOptions } from '@d-fischer/connection';
import { type LoggerOptions } from '@d-fischer/logger';
import { type ResolvableValue } from '@d-fischer/shared-utils';
import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { type AuthProvider } from '@twurple/auth';
/** @private */
interface StaticTokenResolvable {
    type: 'static';
    token: string;
}
/** @private */
interface FunctionTokenResolvable {
    type: 'function';
    function: () => string | Promise<string>;
}
/** @private */
interface ProviderTokenResolvable {
    type: 'provider';
    provider: AuthProvider;
    scopes: string[];
    userId: string;
}
/** @private */
type TokenResolvable = StaticTokenResolvable | FunctionTokenResolvable | ProviderTokenResolvable;
/**
 * Options for the basic PubSub client.
 */
export interface BasicPubSubClientOptions {
    /**
     * Options to pass to the logger.
     */
    logger?: Partial<LoggerOptions>;
    /**
     * The client options to use for connecting to the WebSocket.
     */
    wsOptions?: WebSocketClientOptions;
}
/**
 * A client for the Twitch PubSub interface.
 */
export declare class BasicPubSubClient extends EventEmitter {
    private readonly _connection;
    private readonly _pingOnActivity;
    private readonly _pingOnInactivity;
    private readonly _pingTimeout;
    private _activityPingCheckTimer?;
    private _inactivityPingCheckTimer?;
    private _pingTimeoutTimer?;
    private readonly _onPong;
    private readonly _onResponse;
    /**
     * Fires when a message that matches your listening topics is received.
     *
     * @eventListener
     *
     * @param topic The name of the topic.
     * @param message The message data.
     */
    readonly onMessage: import("@d-fischer/typed-event-emitter").EventBinder<[topic: string, message: unknown]>;
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
    readonly onListenError: import("@d-fischer/typed-event-emitter").EventBinder<[topic: string, error: Error, userInitiated: boolean]>;
    /**
     * Fires when the client finishes establishing a connection to the PubSub server.
     *
     * @eventListener
     */
    readonly onConnect: import("@d-fischer/typed-event-emitter").EventBinder<[]>;
    /**
     * Fires when the client closes its connection to the PubSub server.
     *
     * @eventListener
     * @param isError Whether the cause of the disconnection was an error. A reconnect will be attempted if this is true.
     * @param reason The error object.
     */
    readonly onDisconnect: import("@d-fischer/typed-event-emitter").EventBinder<[isError: boolean, reason?: Error | undefined]>;
    /**
     * Fires when the client receives a pong message from the PubSub server.
     *
     * @eventListener
     * @param latency The current latency to the server, in milliseconds.
     * @param requestTimestampe The time the ping request was sent to the PubSub server.
     */
    readonly onPong: import("@d-fischer/typed-event-emitter").EventBinder<[latency: number, requestTimestamp: number]>;
    /**
     * Creates a new PubSub client.
     *
     * @param options
     *
     * @expandParams
     */
    constructor(options?: BasicPubSubClientOptions);
    /**
     * Listens to one or more topics.
     *
     * @param topics A topic or a list of topics to listen to.
     * @param tokenResolvable An access token, an AuthProvider or a function that returns a token.
     */
    listen(topics: string | string[], tokenResolvable: ResolvableValue<string> | TokenResolvable): void;
    /**
     * Removes one or more topics from the listener.
     *
     * @param topics A topic or a list of topics to not listen to anymore.
     */
    unlisten(topics: string | string[]): void;
    /**
     * Connects to the PubSub interface.
     */
    connect(): void;
    /**
     * Disconnects from the PubSub interface.
     */
    disconnect(): void;
    /**
     * Reconnects to the PubSub interface.
     */
    reconnect(): void;
    /**
     * Checks whether the client is currently connecting to the server.
     */
    get isConnecting(): boolean;
    /**
     * Checks whether the client is currently connected to the server.
     */
    get isConnected(): boolean;
    /** @private */
    get hasAnyTopics(): boolean;
    private _sendListen;
    private _sendUnlisten;
    private static _wrapResolvable;
    private _resolveToken;
    private _resendListens;
    private _sendNonced;
    private _receiveMessage;
    private _sendPacket;
    private _pingCheck;
    private _startActivityPingCheckTimer;
    private _startInactivityPingCheckTimer;
}
export {};
//# sourceMappingURL=BasicPubSubClient.d.ts.map