import { DataObject } from '@twurple/common';
import { type PubSubUnbanRequestMessageData, type PubSubUnbanRequestType } from './PubSubUnbanRequestMessage.external';
/**
 * A message that informs about an approved or denied unban request in a channel.
 */
export declare class PubSubUnbanRequestMessage extends DataObject<PubSubUnbanRequestMessageData> {
    private readonly _channelId;
    constructor(data: PubSubUnbanRequestMessageData, _channelId: string);
    /**
     * The ID of the channel where the action was performed.
     */
    get channelId(): string;
    /**
     * The type of the unban request action.
     */
    get type(): PubSubUnbanRequestType;
    /**
     * The ID of the moderator that performed the action.
     */
    get userId(): string;
    /**
     * The name of the moderator that performed the action.
     */
    get userName(): string;
    /**
     * The note that the moderator left during the resolution of the request.
     */
    get moderatorMessage(): string;
    /**
     * The ID of the user that requested unban.
     */
    get targetUserId(): string;
    /**
     * The name of the user that requested unban.
     */
    get targetUserName(): string;
}
//# sourceMappingURL=PubSubUnbanRequestMessage.d.ts.map