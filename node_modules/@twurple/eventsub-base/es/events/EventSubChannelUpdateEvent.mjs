import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a change in channel metadata.
 */
let EventSubChannelUpdateEvent = class EventSubChannelUpdateEvent extends DataObject {
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
     * The title of the stream.
     */
    get streamTitle() {
        return this[rawDataSymbol].title;
    }
    /**
     * The language of the stream.
     */
    get streamLanguage() {
        return this[rawDataSymbol].language;
    }
    /**
     * The ID of the game that is currently being played on the channel.
     */
    get categoryId() {
        return this[rawDataSymbol].category_id;
    }
    /**
     * The name of the game that is currently being played on the channel.
     */
    get categoryName() {
        return this[rawDataSymbol].category_name;
    }
    /**
     * Gets more information about the game that is currently being played on the channel.
     */
    async getGame() {
        return this[rawDataSymbol].category_id
            ? checkRelationAssertion(await this._client.games.getGameById(this[rawDataSymbol].category_id))
            : null;
    }
    /**
     * Whether the channel is flagged as suitable for mature audiences only.
     */
    get isMature() {
        return this[rawDataSymbol].is_mature;
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelUpdateEvent.prototype, "_client", void 0);
EventSubChannelUpdateEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelUpdateEvent', 'broadcasterId')
], EventSubChannelUpdateEvent);
export { EventSubChannelUpdateEvent };
