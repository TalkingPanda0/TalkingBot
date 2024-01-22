import { type HelixEventSubWebSocketTransportOptions } from '@twurple/api';
import { EventSubBase, type EventSubBaseConfig, type EventSubListener, type EventSubSubscription } from '@twurple/eventsub-base';
/**
 * Configuration for an EventSub WebSocket listener.
 *
 * @inheritDoc
 */
export interface EventSubWsConfig extends EventSubBaseConfig {
    /**
     * The URL to connect to initially.
     *
     * Can be used to connect to a test server, for example one created by the Twitch CLI.
     */
    url?: string;
}
/**
 * A WebSocket listener for the Twitch EventSub event distribution mechanism.
 *
 * @beta
 * @hideProtected
 * @inheritDoc
 *
 * @meta category main
 */
export declare class EventSubWsListener extends EventSubBase implements EventSubListener {
    private readonly _sockets;
    private readonly _initialUrl;
    private _accepting;
    private readonly _loggerOptions?;
    /**
     * Fires when a user socket has established a connection with the EventSub server.
     *
     * @param userId The ID of the user.
     */
    readonly onUserSocketConnect: import("@d-fischer/typed-event-emitter/lib").EventBinder<[userId: string]>;
    /**
     * Fires when a user socket has disconnected from the EventSub server.
     *
     * @param userId The ID of the user.
     * @param error The error that caused the disconnection, or `undefined` for a clean disconnect.
     */
    readonly onUserSocketDisconnect: import("@d-fischer/typed-event-emitter/lib").EventBinder<[userId: string, error?: Error | undefined]>;
    /**
     * Creates a new EventSub HTTP listener.
     *
     * @param config
     *
     * @expandParams
     */
    constructor(config: EventSubWsConfig);
    /**
     * Starts the WebSocket listener.
     */
    start(): void;
    /**
     * Stops the WebSocket listener.
     */
    stop(): void;
    /** @private */
    _getCliTestCommandForSubscription(): Promise<string>;
    /** @private */
    _isReadyToSubscribe(subscription: EventSubSubscription): boolean;
    /** @private */
    _getTransportOptionsForSubscription(subscription: EventSubSubscription): Promise<HelixEventSubWebSocketTransportOptions>;
    /** @private */
    _getSubscriptionsForUser(userId: string): EventSubSubscription[];
    /** @private */
    _handleSubscriptionRevoke(subscription: EventSubSubscription): void;
    protected _genericSubscribe<T, Args extends unknown[]>(clazz: new (handler: (obj: T) => void, client: EventSubBase, ...args: Args) => EventSubSubscription<T>, handler: (obj: T) => void, client: EventSubBase, ...params: Args): EventSubSubscription;
    protected _findTwitchSubscriptionToContinue(): undefined;
}
//# sourceMappingURL=EventSubWsListener.d.ts.map