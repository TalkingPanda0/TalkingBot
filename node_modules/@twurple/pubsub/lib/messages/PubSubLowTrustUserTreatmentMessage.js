"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubLowTrustUserTreatmentMessage = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * A message that informs about treatment against a low-trust user.
 */
let PubSubLowTrustUserTreatmentMessage = class PubSubLowTrustUserTreatmentMessage extends common_1.DataObject {
    /**
     * The ID of the channel where the suspicious user was present.
     */
    get channelId() {
        return this[common_1.rawDataSymbol].data.channel_id;
    }
    /**
     * The ID for the suspicious user entry, which is a combination of the channel ID where the treatment was
     * updated and the user ID of the suspicious user.
     */
    get lowTrustId() {
        return this[common_1.rawDataSymbol].data.low_trust_id;
    }
    /**
     * The user ID of the moderator.
     */
    get moderatorId() {
        return this[common_1.rawDataSymbol].data.updated_by.id;
    }
    /**
     * The name of the moderator.
     */
    get moderatorName() {
        return this[common_1.rawDataSymbol].data.updated_by.login;
    }
    /**
     * The display name of the moderator.
     */
    get moderatorDisplayName() {
        return this[common_1.rawDataSymbol].data.updated_by.display_name;
    }
    /**
     * The date of when the treatment was updated for the suspicious user.
     */
    get updateDate() {
        return new Date(this[common_1.rawDataSymbol].data.updated_at);
    }
    /**
     * The user ID of the suspicious user
     */
    get userId() {
        return this[common_1.rawDataSymbol].data.target_user_id;
    }
    /**
     * The name of the suspicious user.
     */
    get userName() {
        return this[common_1.rawDataSymbol].data.target_user;
    }
    /**
     * The treatment set for the suspicious user.
     */
    get treatment() {
        return this[common_1.rawDataSymbol].data.treatment;
    }
    /**
     * User types (if any) that apply to the suspicious user.
     */
    get types() {
        return this[common_1.rawDataSymbol].data.types;
    }
    /**
     * A ban evasion likelihood value that as been applied to the user automatically by Twitch.
     *
     * Can be an empty string if Twitch did not apply any evasion value.
     */
    get banEvasionEvaluation() {
        return this[common_1.rawDataSymbol].data.ban_evasion_evaluation;
    }
    /**
     * The date for the first time the suspicious user was automatically evaluated by Twitch.
     *
     * Will be `null` if {@link PubSubLowTrustUserTreatmentMessage#banEvasionEvaluation} is empty.
     */
    get evaluationDate() {
        // PubSub sends `0001-01-01T00:00:00.000Z` string if the field is not applicable
        const date = this[common_1.rawDataSymbol].data.evaluated_at
            ? new Date(this[common_1.rawDataSymbol].data.evaluated_at)
            : undefined;
        return date && date.getTime() > 0 ? date : null;
    }
};
PubSubLowTrustUserTreatmentMessage = tslib_1.__decorate([
    (0, common_1.rtfm)('pubsub', 'PubSubLowTrustUserTreatmentMessage', 'lowTrustId')
], PubSubLowTrustUserTreatmentMessage);
exports.PubSubLowTrustUserTreatmentMessage = PubSubLowTrustUserTreatmentMessage;
