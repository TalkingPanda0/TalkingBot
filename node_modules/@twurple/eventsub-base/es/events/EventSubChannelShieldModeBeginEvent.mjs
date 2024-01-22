import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing Shield Mode being activated on a broadcaster's channel.
 */
let EventSubChannelShieldModeBeginEvent = class EventSubChannelShieldModeBeginEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster on whose channel Shield Mode was activated.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster on whose channel Shield Mode was activated.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster on whose channel Shield Mode was activated.
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
     * The ID of the moderator who activated Shield Mode.
     */
    get moderatorId() {
        return this[rawDataSymbol].moderator_user_id;
    }
    /**
     * The name of the moderator who activated Shield Mode.
     */
    get moderatorName() {
        return this[rawDataSymbol].moderator_user_login;
    }
    /**
     * The display name of the moderator who activated Shield Mode
     */
    get moderatorDisplayName() {
        return this[rawDataSymbol].moderator_user_name;
    }
    /**
     * Gets more information about the moderator.
     */
    async getModerator() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].moderator_user_id));
    }
    /**
     * The date when Shield Mode was activated.
     */
    get startDate() {
        return new Date(this[rawDataSymbol].started_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelShieldModeBeginEvent.prototype, "_client", void 0);
EventSubChannelShieldModeBeginEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelShieldModeBeginEvent')
], EventSubChannelShieldModeBeginEvent);
export { EventSubChannelShieldModeBeginEvent };
