"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixShieldModeStatus = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * Information about the Shield Mode status of a channel.
 */
let HelixShieldModeStatus = class HelixShieldModeStatus extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * Whether Shield Mode is active.
     */
    get isActive() {
        return this[common_1.rawDataSymbol].is_active;
    }
    /**
     * The ID of the moderator that last activated Shield Mode.
     */
    get moderatorId() {
        return this[common_1.rawDataSymbol].moderator_id;
    }
    /**
     * The name of the moderator that last activated Shield Mode.
     */
    get moderatorName() {
        return this[common_1.rawDataSymbol].moderator_login;
    }
    /**
     * The display name of the moderator that last activated Shield Mode.
     */
    get moderatorDisplayName() {
        return this[common_1.rawDataSymbol].moderator_name;
    }
    /**
     * Gets more information about the moderator that last activated Shield Mode.
     */
    async getModerator() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].moderator_id));
    }
    /**
     * The date when Shield Mode was last activated. `null` indicates Shield Mode hasn't been previously activated.
     */
    get lastActivationDate() {
        return this[common_1.rawDataSymbol].last_activated_at === '' ? null : new Date(this[common_1.rawDataSymbol].last_activated_at);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixShieldModeStatus.prototype, "_client", void 0);
HelixShieldModeStatus = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixShieldModeStatus')
], HelixShieldModeStatus);
exports.HelixShieldModeStatus = HelixShieldModeStatus;
