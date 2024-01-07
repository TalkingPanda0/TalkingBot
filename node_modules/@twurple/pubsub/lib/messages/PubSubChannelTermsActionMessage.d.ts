import { DataObject } from '@twurple/common';
import { type PubSubChannelTermsActionMessageData } from './PubSubChannelTermsActionMessage.external';
/**
 * A message that informs about an allowed or blocked term being added or removed in a channel.
 */
export declare class PubSubChannelTermsActionMessage extends DataObject<PubSubChannelTermsActionMessageData> {
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
     * The term that was added/removed.
     */
    get term(): string;
    /**
     * Whether the addition of the term originated from automod blocking a message.
     */
    get isFromAutoMod(): boolean;
    /**
     * The user ID of the moderator that performed the action.
     */
    get userId(): string;
    /**
     * The name of the moderator that performed the action.
     */
    get userName(): string;
}
//# sourceMappingURL=PubSubChannelTermsActionMessage.d.ts.map