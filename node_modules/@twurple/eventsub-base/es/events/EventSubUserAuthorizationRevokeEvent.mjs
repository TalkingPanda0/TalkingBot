import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a user revoking authorization for an application.
 */
let EventSubUserAuthorizationRevokeEvent = class EventSubUserAuthorizationRevokeEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the user who revoked their authorization.
     */
    get userId() {
        return this[rawDataSymbol].user_id;
    }
    /**
     * The name of the user who revoked their authorization.
     *
     * This is `null` if the user no longer exists.
     */
    get userName() {
        return this[rawDataSymbol].user_login;
    }
    /**
     * The display name of the user who revoked their authorization.
     *
     * This is `null` if the user no longer exists.
     */
    get userDisplayName() {
        return this[rawDataSymbol].user_name;
    }
    /**
     * Gets more information about the user.
     */
    async getUser() {
        if (this[rawDataSymbol].user_login == null) {
            return null;
        }
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].user_id));
    }
    /**
     * The Client ID of the application that the user revoked authorization for.
     */
    get clientId() {
        return this[rawDataSymbol].client_id;
    }
};
__decorate([
    Enumerable(false)
], EventSubUserAuthorizationRevokeEvent.prototype, "_client", void 0);
EventSubUserAuthorizationRevokeEvent = __decorate([
    rtfm('eventsub-base', 'EventSubUserAuthorizationRevokeEvent', 'userId')
], EventSubUserAuthorizationRevokeEvent);
export { EventSubUserAuthorizationRevokeEvent };
