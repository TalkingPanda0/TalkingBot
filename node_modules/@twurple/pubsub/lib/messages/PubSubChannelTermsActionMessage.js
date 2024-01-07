"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubChannelTermsActionMessage = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * A message that informs about an allowed or blocked term being added or removed in a channel.
 */
let PubSubChannelTermsActionMessage = class PubSubChannelTermsActionMessage extends common_1.DataObject {
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
     * The type of the message.
     */
    get type() {
        return this[common_1.rawDataSymbol].data.type;
    }
    /**
     * The term that was added/removed.
     */
    get term() {
        return this[common_1.rawDataSymbol].data.text;
    }
    /**
     * Whether the addition of the term originated from automod blocking a message.
     */
    get isFromAutoMod() {
        return this[common_1.rawDataSymbol].data.from_automod;
    }
    /**
     * The user ID of the moderator that performed the action.
     */
    get userId() {
        return this[common_1.rawDataSymbol].data.requester_id;
    }
    /**
     * The name of the moderator that performed the action.
     */
    get userName() {
        return this[common_1.rawDataSymbol].data.requester_login;
    }
};
PubSubChannelTermsActionMessage = tslib_1.__decorate([
    (0, common_1.rtfm)('pubsub', 'PubSubChannelTermsActionMessage', 'userId')
], PubSubChannelTermsActionMessage);
exports.PubSubChannelTermsActionMessage = PubSubChannelTermsActionMessage;
