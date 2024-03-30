import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a chat message being deleted in a channel.
 */
let EventSubChannelChatMessageDeleteEvent = class EventSubChannelChatMessageDeleteEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the user whose chat message was deleted.
     */
    get userId() {
        return this[rawDataSymbol].target_user_id;
    }
    /**
     * The name of the user whose chat message was deleted.
     */
    get userName() {
        return this[rawDataSymbol].target_user_login;
    }
    /**
     * The display name of the user whose chat message was deleted.
     */
    get userDisplayName() {
        return this[rawDataSymbol].target_user_name;
    }
    /**
     * Gets more information about the user whose chat message was deleted.
     */
    async getUser() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].target_user_id));
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
    /**
     * The ID of the message that was deleted.
     */
    get messageId() {
        return this[rawDataSymbol].message_id;
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelChatMessageDeleteEvent.prototype, "_client", void 0);
EventSubChannelChatMessageDeleteEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelChatMessageDeleteEvent', 'broadcasterId')
], EventSubChannelChatMessageDeleteEvent);
export { EventSubChannelChatMessageDeleteEvent };
