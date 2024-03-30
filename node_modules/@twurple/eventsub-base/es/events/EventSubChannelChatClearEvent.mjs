import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a channel's chat being cleared.
 */
let EventSubChannelChatClearEvent = class EventSubChannelChatClearEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName() {
        return this[rawDataSymbol].broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].broadcaster_user_id));
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelChatClearEvent.prototype, "_client", void 0);
EventSubChannelChatClearEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelChatClearEvent', 'broadcasterId')
], EventSubChannelChatClearEvent);
export { EventSubChannelChatClearEvent };
