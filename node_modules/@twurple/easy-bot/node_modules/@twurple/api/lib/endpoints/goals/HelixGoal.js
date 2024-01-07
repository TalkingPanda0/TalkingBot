"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixGoal = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * A creator goal.
 */
let HelixGoal = class HelixGoal extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the goal.
     */
    get id() {
        return this[common_1.rawDataSymbol].id;
    }
    /**
     * The ID of the broadcaster the goal belongs to.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * The display name of the broadcaster the goal belongs to.
     */
    get broadcasterDisplayName() {
        return this[common_1.rawDataSymbol].broadcaster_name;
    }
    /**
     * The name of the broadcaster the goal belongs to.
     */
    get broadcasterName() {
        return this[common_1.rawDataSymbol].broadcaster_login;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_id));
    }
    /**
     * The type of the goal.
     */
    get type() {
        return this[common_1.rawDataSymbol].type;
    }
    /**
     * The description of the goal.
     */
    get description() {
        return this[common_1.rawDataSymbol].description;
    }
    /**
     * The current value of the goal.
     */
    get currentAmount() {
        return this[common_1.rawDataSymbol].current_amount;
    }
    /**
     * The target value of the goal.
     */
    get targetAmount() {
        return this[common_1.rawDataSymbol].target_amount;
    }
    /**
     * The date and time when the goal was created.
     */
    get creationDate() {
        return this[common_1.rawDataSymbol].created_at;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixGoal.prototype, "_client", void 0);
HelixGoal = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixGoal', 'id')
], HelixGoal);
exports.HelixGoal = HelixGoal;
