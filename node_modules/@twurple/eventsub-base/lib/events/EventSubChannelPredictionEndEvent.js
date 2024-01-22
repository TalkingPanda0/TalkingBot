"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubChannelPredictionEndEvent = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const EventSubChannelPredictionOutcome_1 = require("./common/EventSubChannelPredictionOutcome");
/**
 * An EventSub event representing a prediction being locked in a channel.
 */
let EventSubChannelPredictionEndEvent = class EventSubChannelPredictionEndEvent extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the prediction.
     */
    get id() {
        return this[common_1.rawDataSymbol].id;
    }
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_user_id;
    }
    /**
     * The name of the broadcaster.
     */
    get broadcasterName() {
        return this[common_1.rawDataSymbol].broadcaster_user_login;
    }
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName() {
        return this[common_1.rawDataSymbol].broadcaster_user_name;
    }
    /**
     * Gets more information about the broadcaster.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_user_id));
    }
    /**
     * The title of the prediction.
     */
    get title() {
        return this[common_1.rawDataSymbol].title;
    }
    /**
     * The possible outcomes of the prediction.
     */
    get outcomes() {
        return this[common_1.rawDataSymbol].outcomes.map(data => new EventSubChannelPredictionOutcome_1.EventSubChannelPredictionOutcome(data, this._client));
    }
    /**
     * The time when the prediction started.
     */
    get startDate() {
        return new Date(this[common_1.rawDataSymbol].started_at);
    }
    /**
     * The time when the prediction ended.
     */
    get endDate() {
        return new Date(this[common_1.rawDataSymbol].ended_at);
    }
    /**
     * The status of the prediction.
     */
    get status() {
        return this[common_1.rawDataSymbol].status;
    }
    /**
     * The ID of the winning outcome, or null if the prediction was canceled.
     */
    get winningOutcomeId() {
        // can apparently be empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return this[common_1.rawDataSymbol].winning_outcome_id || null;
    }
    /**
     * The winning outcome, or null if the prediction was canceled.
     */
    get winningOutcome() {
        if (!this[common_1.rawDataSymbol].winning_outcome_id) {
            return null;
        }
        const found = this[common_1.rawDataSymbol].outcomes.find(o => o.id === this[common_1.rawDataSymbol].winning_outcome_id);
        if (!found) {
            throw new common_1.HellFreezesOverError('Winning outcome not found in outcomes array');
        }
        return new EventSubChannelPredictionOutcome_1.EventSubChannelPredictionOutcome(found, this._client);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], EventSubChannelPredictionEndEvent.prototype, "_client", void 0);
EventSubChannelPredictionEndEvent = tslib_1.__decorate([
    (0, common_1.rtfm)('eventsub-base', 'EventSubChannelPredictionEndEvent', 'broadcasterId')
], EventSubChannelPredictionEndEvent);
exports.EventSubChannelPredictionEndEvent = EventSubChannelPredictionEndEvent;
