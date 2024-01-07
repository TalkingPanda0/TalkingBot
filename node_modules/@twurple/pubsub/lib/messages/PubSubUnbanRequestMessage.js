"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubUnbanRequestMessage = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * A message that informs about an approved or denied unban request in a channel.
 */
let PubSubUnbanRequestMessage = class PubSubUnbanRequestMessage extends common_1.DataObject {
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
        return this[common_1.rawDataSymbol].data.moderation_action;
    }
    /**
     * The ID of the moderator that performed the action.
     */
    get userId() {
        return this[common_1.rawDataSymbol].data.created_by_id;
    }
    /**
     * The name of the moderator that performed the action.
     */
    get userName() {
        return this[common_1.rawDataSymbol].data.created_by_login;
    }
    /**
     * The note that the moderator left during the resolution of the request.
     */
    get moderatorMessage() {
        return this[common_1.rawDataSymbol].data.moderator_message;
    }
    /**
     * The ID of the user that requested unban.
     */
    get targetUserId() {
        return this[common_1.rawDataSymbol].data.target_user_id;
    }
    /**
     * The name of the user that requested unban.
     */
    get targetUserName() {
        return this[common_1.rawDataSymbol].data.target_user_login;
    }
};
PubSubUnbanRequestMessage = tslib_1.__decorate([
    (0, common_1.rtfm)('pubsub', 'PubSubUnbanRequestMessage', 'userId')
], PubSubUnbanRequestMessage);
exports.PubSubUnbanRequestMessage = PubSubUnbanRequestMessage;
