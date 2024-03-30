import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a user's chat messages being cleared in a channel.
 */
let EventSubChannelChatClearUserMessagesEvent = class EventSubChannelChatClearUserMessagesEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the user whose chat messages were cleared.
     */
    get userId() {
        return this[rawDataSymbol].target_user_id;
    }
    /**
     * The name of the user whose chat messages were cleared.
     */
    get userName() {
        return this[rawDataSymbol].target_user_login;
    }
    /**
     * The display name of the user whose chat messages were cleared.
     */
    get userDisplayName() {
        return this[rawDataSymbol].target_user_name;
    }
    /**
     * Gets more information about the user whose chat messages were cleared.
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
};
__decorate([
    Enumerable(false)
], EventSubChannelChatClearUserMessagesEvent.prototype, "_client", void 0);
EventSubChannelChatClearUserMessagesEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelChatClearUserMessagesEvent', 'broadcasterId')
], EventSubChannelChatClearUserMessagesEvent);
export { EventSubChannelChatClearUserMessagesEvent };
