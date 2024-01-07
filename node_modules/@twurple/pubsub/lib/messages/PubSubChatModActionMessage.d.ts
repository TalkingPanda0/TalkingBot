import { DataObject } from '@twurple/common';
import { type PubSubChatModActionMessageData } from './PubSubChatModActionMessage.external';
/**
 * A message that informs about a moderation action being performed in a channel.
 */
export declare class PubSubChatModActionMessage extends DataObject<PubSubChatModActionMessageData> {
    private readonly _channelId;
    /**
     * The ID of the channel where the action was performed.
     */
    get channelId(): string;
    /**
     * The type of the message.
     */
    get type(): string;
    /**
     * The action that was performed.
     */
    get action(): string;
    /**
     * The arguments given to the action.
     */
    get args(): string[];
    /**
     * The user ID of the moderator that performed the action.
     */
    get userId(): string;
    /**
     * The name of the moderator that performed the action.
     */
    get userName(): string;
}
//# sourceMappingURL=PubSubChatModActionMessage.d.ts.map