import { __decorate } from "tslib";
import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * A message that informs about treatment against a low-trust user.
 */
let PubSubLowTrustUserTreatmentMessage = class PubSubLowTrustUserTreatmentMessage extends DataObject {
    /**
     * The ID of the channel where the suspicious user was present.
     */
    get channelId() {
        return this[rawDataSymbol].data.channel_id;
    }
    /**
     * The ID for the suspicious user entry, which is a combination of the channel ID where the treatment was
     * updated and the user ID of the suspicious user.
     */
    get lowTrustId() {
        return this[rawDataSymbol].data.low_trust_id;
    }
    /**
     * The user ID of the moderator.
     */
    get moderatorId() {
        return this[rawDataSymbol].data.updated_by.id;
    }
    /**
     * The name of the moderator.
     */
    get moderatorName() {
        return this[rawDataSymbol].data.updated_by.login;
    }
    /**
     * The display name of the moderator.
     */
    get moderatorDisplayName() {
        return this[rawDataSymbol].data.updated_by.display_name;
    }
    /**
     * The date of when the treatment was updated for the suspicious user.
     */
    get updateDate() {
        return new Date(this[rawDataSymbol].data.updated_at);
    }
    /**
     * The user ID of the suspicious user
     */
    get userId() {
        return this[rawDataSymbol].data.target_user_id;
    }
    /**
     * The name of the suspicious user.
     */
    get userName() {
        return this[rawDataSymbol].data.target_user;
    }
    /**
     * The treatment set for the suspicious user.
     */
    get treatment() {
        return this[rawDataSymbol].data.treatment;
    }
    /**
     * User types (if any) that apply to the suspicious user.
     */
    get types() {
        return this[rawDataSymbol].data.types;
    }
    /**
     * A ban evasion likelihood value that as been applied to the user automatically by Twitch.
     *
     * Can be an empty string if Twitch did not apply any evasion value.
     */
    get banEvasionEvaluation() {
        return this[rawDataSymbol].data.ban_evasion_evaluation;
    }
    /**
     * The date for the first time the suspicious user was automatically evaluated by Twitch.
     *
     * Will be `null` if {@link PubSubLowTrustUserTreatmentMessage#banEvasionEvaluation} is empty.
     */
    get evaluationDate() {
        // PubSub sends `0001-01-01T00:00:00.000Z` string if the field is not applicable
        const date = this[rawDataSymbol].data.evaluated_at
            ? new Date(this[rawDataSymbol].data.evaluated_at)
            : undefined;
        return date && date.getTime() > 0 ? date : null;
    }
};
PubSubLowTrustUserTreatmentMessage = __decorate([
    rtfm('pubsub', 'PubSubLowTrustUserTreatmentMessage', 'lowTrustId')
], PubSubLowTrustUserTreatmentMessage);
export { PubSubLowTrustUserTreatmentMessage };
