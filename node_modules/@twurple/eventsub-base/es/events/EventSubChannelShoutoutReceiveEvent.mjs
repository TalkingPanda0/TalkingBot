import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a broadcaster being shouted out by another broadcaster.
 */
let EventSubChannelShoutoutReceiveEvent = class EventSubChannelShoutoutReceiveEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster who received the shoutout.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster who received the shoutout.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster who received the shoutout.
     */
    get broadcasterDisplayName() {
        return this[rawDataSymbol].broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster who received the shoutout.
     */
    async getBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].broadcaster_user_id));
    }
    /**
     * The ID of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterId() {
        return this[rawDataSymbol].from_broadcaster_user_id;
    }
    /**
     * The name of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterName() {
        return this[rawDataSymbol].from_broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster who sent the shoutout.
     */
    get shoutingOutBroadcasterDisplayName() {
        return this[rawDataSymbol].from_broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster who sent the shoutout.
     */
    async getShoutingOutBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].from_broadcaster_user_id));
    }
    /**
     * The amount of viewers who were watching the sending broadcaster's stream at the time of the shoutout.
     */
    get viewerCount() {
        return this[rawDataSymbol].viewer_count;
    }
    /**
     * The Date when the shoutout was sent.
     */
    get startDate() {
        return new Date(this[rawDataSymbol].started_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelShoutoutReceiveEvent.prototype, "_client", void 0);
EventSubChannelShoutoutReceiveEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelShoutoutReceiveEvent', 'shoutingOutBroadcasterId')
], EventSubChannelShoutoutReceiveEvent);
export { EventSubChannelShoutoutReceiveEvent };
