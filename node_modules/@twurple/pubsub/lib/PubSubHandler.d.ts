import type { PubSubMessage } from './messages/PubSubMessage';
/**
 * A handler attached to a single PubSub topic.
 */
export declare class PubSubHandler<T extends PubSubMessage = PubSubMessage> {
    private readonly _topic;
    private readonly _userId;
    private readonly _callback;
    /**
     * The type of the topic.
     */
    get topic(): string;
    /**
     * The user ID part of the topic.
     */
    get userId(): string;
    /**
     * Removes the topic from the PubSub client.
     */
    remove(): void;
}
//# sourceMappingURL=PubSubHandler.d.ts.map