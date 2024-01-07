import { DataObject } from '@twurple/common';
import { type PubSubAutoModQueueMessageContentClassification, type PubSubAutoModQueueMessageData, type PubSubAutoModQueueMessageFragment, type PubSubAutoModQueueStatus } from './PubSubAutoModQueueMessage.external';
/**
 * A message that informs about a message being processed in the AutoMod queue.
 */
export declare class PubSubAutoModQueueMessage extends DataObject<PubSubAutoModQueueMessageData> {
    private readonly _channelId;
    /**
     * The ID of the channel where the message was posted.
     */
    get channelId(): string;
    /**
     * The ID of the message.
     */
    get messageId(): string;
    /**
     * The content of the message.
     */
    get messageContent(): string;
    /**
     * The fragments of the message that were found to be against the moderation level of the channel.
     */
    get foundMessageFragments(): PubSubAutoModQueueMessageFragment[];
    /**
     * The ID of the user that sent the message.
     */
    get senderId(): string;
    /**
     * The name of the user that sent the message.
     */
    get senderName(): string;
    /**
     * The display name of the user that sent the message.
     */
    get senderDisplayName(): string;
    /**
     * The chat color of the user that sent the message.
     */
    get senderColor(): string;
    /**
     * The date when the message was sent.
     */
    get sendDate(): Date;
    /**
     * The classification of the message content.
     */
    get contentClassification(): PubSubAutoModQueueMessageContentClassification;
    /**
     * The status of the queue entry.
     */
    get status(): PubSubAutoModQueueStatus;
    /**
     * The ID of the user that resolved the queue entry, or null if it was not resolved or timed out.
     */
    get resolverId(): string | null;
    /**
     * The name of the user that resolved the queue entry, or null if it was not resolved or timed out.
     */
    get resolverName(): string | null;
}
//# sourceMappingURL=PubSubAutoModQueueMessage.d.ts.map