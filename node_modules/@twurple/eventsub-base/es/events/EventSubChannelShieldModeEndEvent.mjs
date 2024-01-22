import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing Shield Mode being deactivated on a broadcaster's channel.
 */
let EventSubChannelShieldModeEndEvent = class EventSubChannelShieldModeEndEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the broadcaster on whose channel Shield Mode was deactivated.
     */
    get broadcasterId() {
        return this[rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster on whose channel Shield Mode was deactivated.
     */
    get broadcasterName() {
        return this[rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster on whose channel Shield Mode was deactivated.
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
     * The ID of the moderator who deactivated Shield Mode.
     */
    get moderatorId() {
        return this[rawDataSymbol].moderator_user_id;
    }
    /**
     * The name of the moderator who deactivated Shield Mode.
     */
    get moderatorName() {
        return this[rawDataSymbol].moderator_user_login;
    }
    /**
     * The display name of the moderator who deactivated Shield Mode
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
     * The date when Shield Mode was deactivated.
     */
    get endDate() {
        return new Date(this[rawDataSymbol].ended_at);
    }
};
__decorate([
    Enumerable(false)
], EventSubChannelShieldModeEndEvent.prototype, "_client", void 0);
EventSubChannelShieldModeEndEvent = __decorate([
    rtfm('eventsub-base', 'EventSubChannelShieldModeEndEvent')
], EventSubChannelShieldModeEndEvent);
export { EventSubChannelShieldModeEndEvent };
