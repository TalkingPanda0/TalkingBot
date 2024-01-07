import { __decorate } from "tslib";
import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * A message that informs about an allowed or blocked term being added or removed in a channel.
 */
let PubSubChannelTermsActionMessage = class PubSubChannelTermsActionMessage extends DataObject {
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
        return this[rawDataSymbol].data.type;
    }
    /**
     * The term that was added/removed.
     */
    get term() {
        return this[rawDataSymbol].data.text;
    }
    /**
     * Whether the addition of the term originated from automod blocking a message.
     */
    get isFromAutoMod() {
        return this[rawDataSymbol].data.from_automod;
    }
    /**
     * The user ID of the moderator that performed the action.
     */
    get userId() {
        return this[rawDataSymbol].data.requester_id;
    }
    /**
     * The name of the moderator that performed the action.
     */
    get userName() {
        return this[rawDataSymbol].data.requester_login;
    }
};
PubSubChannelTermsActionMessage = __decorate([
    rtfm('pubsub', 'PubSubChannelTermsActionMessage', 'userId')
], PubSubChannelTermsActionMessage);
export { PubSubChannelTermsActionMessage };
