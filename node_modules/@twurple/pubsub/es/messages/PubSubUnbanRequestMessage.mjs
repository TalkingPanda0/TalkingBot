import { __decorate } from "tslib";
import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * A message that informs about an approved or denied unban request in a channel.
 */
let PubSubUnbanRequestMessage = class PubSubUnbanRequestMessage extends DataObject {
    constructor(data, _channelId) {
        super(data);
        this._channelId = _channelId;
    }
    /**
     * The ID of the channel where the action was performed.
     */
    get channelId() {
        return this._channelId;
    }
    /**
     * The type of the unban request action.
     */
    get type() {
        return this[rawDataSymbol].data.moderation_action;
    }
    /**
     * The ID of the moderator that performed the action.
     */
    get userId() {
        return this[rawDataSymbol].data.created_by_id;
    }
    /**
     * The name of the moderator that performed the action.
     */
    get userName() {
        return this[rawDataSymbol].data.created_by_login;
    }
    /**
     * The note that the moderator left during the resolution of the request.
     */
    get moderatorMessage() {
        return this[rawDataSymbol].data.moderator_message;
    }
    /**
     * The ID of the user that requested unban.
     */
    get targetUserId() {
        return this[rawDataSymbol].data.target_user_id;
    }
    /**
     * The name of the user that requested unban.
     */
    get targetUserName() {
        return this[rawDataSymbol].data.target_user_login;
    }
};
PubSubUnbanRequestMessage = __decorate([
    rtfm('pubsub', 'PubSubUnbanRequestMessage', 'userId')
], PubSubUnbanRequestMessage);
export { PubSubUnbanRequestMessage };
