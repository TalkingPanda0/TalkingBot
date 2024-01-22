import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing a user revoking authorization for an application.
 */
let EventSubUserAuthorizationGrantEvent = class EventSubUserAuthorizationGrantEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the user who granted the authorization.
     */
    get userId() {
        return this[rawDataSymbol].user_id;
    }
    /**
     * The name of the user who granted the authorization.
     */
    get userName() {
        return this[rawDataSymbol].user_login;
    }
    /**
     * The display name of the user who granted the authorization.
     */
    get userDisplayName() {
        return this[rawDataSymbol].user_name;
    }
    /**
     * Gets more information about the user.
     */
    async getUser() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].user_id));
    }
    /**
     * The Client ID of the application that the user granted authorization to.
     */
    get clientId() {
        return this[rawDataSymbol].client_id;
    }
};
__decorate([
    Enumerable(false)
], EventSubUserAuthorizationGrantEvent.prototype, "_client", void 0);
EventSubUserAuthorizationGrantEvent = __decorate([
    rtfm('eventsub-base', 'EventSubUserAuthorizationGrantEvent', 'userId')
], EventSubUserAuthorizationGrantEvent);
export { EventSubUserAuthorizationGrantEvent };
