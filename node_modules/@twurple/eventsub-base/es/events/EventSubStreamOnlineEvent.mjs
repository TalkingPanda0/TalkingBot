import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a stream going live.
 */
let EventSubStreamOnlineEvent = class EventSubStreamOnlineEvent extends DataObject {
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
    /**
     * Gets more information about the stream.
     *
     * This may sometimes return null, as the Helix API might be behind due to caching on Twitch's side.
     */
    async getStream() {
        return await this._client.streams.getStreamByUserId(this[rawDataSymbol].broadcaster_user_id);
    }
    /**
     * The ID of the stream going live.
     */
    get id() {
        return this[rawDataSymbol].id;
    }
    /**
     * The type of the stream going live.
     */
    get type() {
        return this[rawDataSymbol].type;
    }
    /**
     * The date and time when the stream was started.
     */
    get startDate() {
        return new Date(this[rawDataSymbol].started_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubStreamOnlineEvent.prototype, "_client", void 0);
EventSubStreamOnlineEvent = __decorate([
    rtfm('eventsub-base', 'EventSubStreamOnlineEvent', 'broadcasterId')
], EventSubStreamOnlineEvent);
export { EventSubStreamOnlineEvent };
