"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubChannelRoleChangeMessage = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * A message that informs about a role change (i.e. vip/mod status being added/removed) in a channel.
 */
let PubSubChannelRoleChangeMessage = class PubSubChannelRoleChangeMessage extends common_1.DataObject {
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
        return this[common_1.rawDataSymbol].type;
    }
    /**
     * The ID of the user that performed the action.
     */
    get userId() {
        return this[common_1.rawDataSymbol].data.created_by_user_id;
    }
    /**
     * The name of the user that performed the action.
     */
    get userName() {
        return this[common_1.rawDataSymbol].data.created_by;
    }
    /**
     * The ID of the user whose role was changed.
     */
    get targetUserId() {
        return this[common_1.rawDataSymbol].data.target_user_id;
    }
    /**
     * The name of the user whose role was changed.
     */
    get targetUserName() {
        return this[common_1.rawDataSymbol].data.target_user_login;
    }
};
PubSubChannelRoleChangeMessage = tslib_1.__decorate([
    (0, common_1.rtfm)('pubsub', 'PubSubChannelRoleChangeMessage', 'userId')
], PubSubChannelRoleChangeMessage);
exports.PubSubChannelRoleChangeMessage = PubSubChannelRoleChangeMessage;
