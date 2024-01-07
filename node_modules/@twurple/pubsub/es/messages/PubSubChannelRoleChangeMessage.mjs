import { __decorate } from "tslib";
import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * A message that informs about a role change (i.e. vip/mod status being added/removed) in a channel.
 */
let PubSubChannelRoleChangeMessage = class PubSubChannelRoleChangeMessage extends DataObject {
    /** @internal */
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
     * The type of the role change.
     */
    get type() {
        return this[rawDataSymbol].type;
    }
    /**
     * The ID of the user that performed the action.
     */
    get userId() {
        return this[rawDataSymbol].data.created_by_user_id;
    }
    /**
     * The name of the user that performed the action.
     */
    get userName() {
        return this[rawDataSymbol].data.created_by;
    }
    /**
     * The ID of the user whose role was changed.
     */
    get targetUserId() {
        return this[rawDataSymbol].data.target_user_id;
    }
    /**
     * The name of the user whose role was changed.
     */
    get targetUserName() {
        return this[rawDataSymbol].data.target_user_login;
    }
};
PubSubChannelRoleChangeMessage = __decorate([
    rtfm('pubsub', 'PubSubChannelRoleChangeMessage', 'userId')
], PubSubChannelRoleChangeMessage);
export { PubSubChannelRoleChangeMessage };
