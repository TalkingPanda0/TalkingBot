import { DataObject } from '@twurple/common';
import { type PubSubChannelRoleChangeMessageData, type PubSubChannelRoleChangeType } from './PubSubChannelRoleChangeMessage.external';
/**
 * A message that informs about a role change (i.e. vip/mod status being added/removed) in a channel.
 */
export declare class PubSubChannelRoleChangeMessage extends DataObject<PubSubChannelRoleChangeMessageData> {
    private readonly _channelId;
    /**
     * The ID of the channel where the action was performed.
     */
    get channelId(): string;
    /**
     * The type of the role change.
     */
    get type(): PubSubChannelRoleChangeType;
    /**
     * The ID of the user that performed the action.
     */
    get userId(): string;
    /**
     * The name of the user that performed the action.
     */
    get userName(): string;
    /**
     * The ID of the user whose role was changed.
     */
    get targetUserId(): string;
    /**
     * The name of the user whose role was changed.
     */
    get targetUserName(): string;
}
//# sourceMappingURL=PubSubChannelRoleChangeMessage.d.ts.map