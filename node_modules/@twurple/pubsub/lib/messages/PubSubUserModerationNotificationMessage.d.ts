import { DataObject } from '@twurple/common';
import { type PubSubUserModerationNotificationMessageData, type PubSubUserModerationNotificationMessageStatus } from './PubSubUserModerationNotificationMessage.external';
/**
 * A message that informs about a moderation action on your message..
 */
export declare class PubSubUserModerationNotificationMessage extends DataObject<PubSubUserModerationNotificationMessageData> {
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
     * The status of the queue entry.
     */
    get status(): PubSubUserModerationNotificationMessageStatus;
}
//# sourceMappingURL=PubSubUserModerationNotificationMessage.d.ts.map