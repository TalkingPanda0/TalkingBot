import { __decorate } from "tslib";
import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
/**
 * A message that informs about a new chat message from a low-trust user.
 */
let PubSubLowTrustUserChatMessage = class PubSubLowTrustUserChatMessage extends DataObject {
    /**
     * The ID of the channel where the suspicious user was present.
     */
    get channelId() {
        return this[rawDataSymbol].data.low_trust_user.channel_id;
    }
    /**
     * The unique ID of this low-trust event.
     */
    get lowTrustId() {
        return this[rawDataSymbol].data.low_trust_user.low_trust_id;
    }
    /**
     * The user ID of the moderator.
     */
    get moderatorId() {
        return this[rawDataSymbol].data.low_trust_user.updated_by.id;
    }
    /**
     * The name of the moderator.
     */
    get moderatorName() {
        return this[rawDataSymbol].data.low_trust_user.updated_by.login;
    }
    /**
     * The display name of the moderator.
     */
    get moderatorDisplayName() {
        return this[rawDataSymbol].data.low_trust_user.updated_by.display_name;
    }
    /**
     * The date of when the treatment was updated for the suspicious user.
     */
    get updateDate() {
        return new Date(this[rawDataSymbol].data.low_trust_user.updated_at);
    }
    /**
     * The user ID of the suspicious user.
     */
    get userId() {
        return this[rawDataSymbol].data.low_trust_user.sender.user_id;
    }
    /**
     * The name of the suspicious user.
     */
    get userName() {
        return this[rawDataSymbol].data.low_trust_user.sender.login;
    }
    /**
     * The display name of the suspicious user.
     */
    get userDisplayName() {
        return this[rawDataSymbol].data.low_trust_user.sender.display_name;
    }
    /**
     * The treatment set for the suspicious user.
     */
    get treatment() {
        return this[rawDataSymbol].data.low_trust_user.treatment;
    }
    /**
     * User types (if any) that apply to the suspicious user.
     */
    get types() {
        return this[rawDataSymbol].data.low_trust_user.types;
    }
    /**
     * The ban evasion likelihood value that as been applied to the user automatically by Twitch.
     *
     * Can be an empty string if Twitch did not apply any evasion value.
     */
    get banEvasionEvaluation() {
        return this[rawDataSymbol].data.low_trust_user.ban_evasion_evaluation;
    }
    /**
     * The date for the first time the suspicious user was automatically evaluated by Twitch.
     *
     * Will be `null` if {@link PubSubLowTrustUserChatMessage#banEvasionEvaluation} is empty.
     */
    get evaluationDate() {
        // PubSub sends `0001-01-01T00:00:00.000Z` string if the field is not applicable
        const date = this[rawDataSymbol].data.low_trust_user.evaluated_at
            ? new Date(this[rawDataSymbol].data.low_trust_user.evaluated_at)
            : undefined;
        return date && date.getTime() > 0 ? date : null;
    }
    /**
     * A list of channel IDs where the suspicious user is also banned.
     */
    get sharedBanChannelIds() {
        var _a;
        return (_a = this[rawDataSymbol].data.low_trust_user.shared_ban_channel_ids) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * The ID of the chat message.
     */
    get messageId() {
        return this[rawDataSymbol].data.message_id;
    }
    /**
     * Plain text of the message sent.
     */
    get content() {
        return this[rawDataSymbol].data.message_content.text;
    }
    /**
     * Fragments contained in the message, including emotes.
     */
    get fragments() {
        return this[rawDataSymbol].data.message_content.fragments;
    }
    /**
     * Date when the chat message was sent.
     */
    get sendDate() {
        return new Date(this[rawDataSymbol].data.sent_at);
    }
};
PubSubLowTrustUserChatMessage = __decorate([
    rtfm('pubsub', 'PubSubLowTrustUserChatMessage', 'lowTrustId')
], PubSubLowTrustUserChatMessage);
export { PubSubLowTrustUserChatMessage };
