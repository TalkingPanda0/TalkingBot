import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a broadcaster shouting out another broadcaster.
 */
let EventSubChannelShoutoutCreateEvent = class EventSubChannelShoutoutCreateEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster from whose channel the shoutout was sent.
     */
    get broadcasterDisplayName() {
        return this[rawDataSymbol].broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster from whose channel the shoutout was sent.
     */
    async getBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].broadcaster_user_id));
    }
    /**
     * The ID of the moderator who sent the shoutout.
     */
    get moderatorId() {
        return this[rawDataSymbol].moderator_user_id;
    }
    /**
     * The name of the moderator who sent the shoutout.
     */
    get moderatorName() {
        return this[rawDataSymbol].moderator_user_login;
    }
    /**
     * The display name of the moderator who sent the shoutout.
     */
    get moderatorDisplayName() {
        return this[rawDataSymbol].moderator_user_name;
    }
    /**
     * Gets more information about the moderator who sent the shoutout.
     */
    async getModerator() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].moderator_user_id));
    }
    /**
     * The ID of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterId() {
        return this[rawDataSymbol].to_broadcaster_user_id;
    }
    /**
     * The name of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterName() {
        return this[rawDataSymbol].to_broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster who was shoutout out.
     */
    get shoutedOutBroadcasterDisplayName() {
        return this[rawDataSymbol].to_broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster who was shoutout out.
     */
    async getShoutedOutBroadcaster() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].to_broadcaster_user_id));
    }
    /**
     * The amount of viewers who were watching the sending broadcaster's stream at the time they sent the shoutout.
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
    /**
     * The Date when the broadcaster may send a shoutout to a different broadcaster.
     */
    get cooldownEndDate() {
        return new Date(this[rawDataSymbol].cooldown_ends_at);
    }
    /**
     * The Date when the broadcaster may send another shoutout to the same broadcaster.
     */
    get targetCooldownEndDate() {
        return new Date(this[rawDataSymbol].target_cooldown_ends_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelShoutoutCreateEvent.prototype, "_client", void 0);
EventSubChannelShoutoutCreateEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelShoutoutCreateEvent', 'shoutedOutBroadcasterId')
], EventSubChannelShoutoutCreateEvent);
export { EventSubChannelShoutoutCreateEvent };
