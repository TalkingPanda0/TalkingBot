"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixBanUser = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * Information about a user who has been banned/timed out.
 *
 * @hideProtected
 */
let HelixBanUser = class HelixBanUser extends common_1.DataObject {
    /** @internal */
    constructor(data, expiryTimestamp, client) {
        super(data);
        this._expiryTimestamp = expiryTimestamp;
        this._client = client;
    }
    /**
     * The date and time that the ban/timeout was created.
     */
    get creationDate() {
        return new Date(this[common_1.rawDataSymbol].created_at);
    }
    /**
     * The date and time that the timeout will end. Is `null` if the user was banned instead of put in a timeout.
     */
    get expiryDate() {
        return (0, shared_utils_1.mapNullable)(this._expiryTimestamp, ts => new Date(ts));
    }
    /**
     * The ID of the moderator that banned or put the user in the timeout.
     */
    get moderatorId() {
        return this[common_1.rawDataSymbol].moderator_id;
    }
    /**
     * Gets more information about the moderator that banned or put the user in the timeout.
     */
    async getModerator() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].moderator_id));
    }
    /**
     * The ID of the user that was banned or put in a timeout.
     */
    get userId() {
        return this[common_1.rawDataSymbol].user_id;
    }
    /**
     * Gets more information about the user that was banned or put in a timeout.
     */
    async getUser() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].user_id));
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixBanUser.prototype, "_client", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixBanUser.prototype, "_expiryTimestamp", void 0);
HelixBanUser = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixBanUser', 'userId')
], HelixBanUser);
exports.HelixBanUser = HelixBanUser;
