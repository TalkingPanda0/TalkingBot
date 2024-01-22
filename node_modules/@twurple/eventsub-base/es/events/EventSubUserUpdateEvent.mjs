import { __decorate } from "tslib";
import { Enumerable } from '@d-fischer/shared-utils';
import { checkRelationAssertion, DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * An EventSub event representing updating their account details.
 */
let EventSubUserUpdateEvent = class EventSubUserUpdateEvent extends DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the user.
     */
    get userId() {
        return this[rawDataSymbol].user_id;
    }
    /**
     * The name of the user.
     */
    get userName() {
        return this[rawDataSymbol].user_login;
    }
    /**
     * The display name of the user.
     */
    get userDisplayName() {
        return this[rawDataSymbol].user_name;
    }
    /**
     * The user's profile description.
     */
    get userDescription() {
        return this[rawDataSymbol].description;
    }
    /**
     * The user's email address.
     *
     * This is `null` if you are not authorized to read the email address,
     * i.e. you have never successfully requested the scope `user:read:email` from the user.
     */
    get userEmail() {
        var _a;
        return (_a = this[rawDataSymbol].email) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Whether the user's email address has been verified by Twitch.
     *
     * This is `null` if you are not authorized to read the email address,
     * i.e. you have never successfully requested the scope `user:read:email` from the user.
     */
    get userEmailIsVerified() {
        return this[rawDataSymbol].email ? this[rawDataSymbol].email_verified : null;
    }
    /**
     * Gets more information about the user.
     */
    async getUser() {
        return checkRelationAssertion(await this._client.users.getUserById(this[rawDataSymbol].user_id));
    }
};
__decorate([
    Enumerable(false)
], EventSubUserUpdateEvent.prototype, "_client", void 0);
EventSubUserUpdateEvent = __decorate([
    rtfm('eventsub-base', 'EventSubUserUpdateEvent', 'userId')
], EventSubUserUpdateEvent);
export { EventSubUserUpdateEvent };
