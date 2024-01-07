import { DataObject } from '@twurple/common';
import { type PubSubLowTrustUserBanEvasionEvaluationType, type PubSubLowTrustUserTreatmentType, type PubSubLowTrustUserType } from './common/PubSubLowTrustUserContentBase.external';
import { type PubSubLowTrustUserChatMessageContentFragmentData, type PubSubLowTrustUserChatMessageData } from './PubSubLowTrustUserChatMessage.external';
/**
 * A message that informs about a new chat message from a low-trust user.
 */
export declare class PubSubLowTrustUserChatMessage extends DataObject<PubSubLowTrustUserChatMessageData> {
    /**
     * The ID of the channel where the suspicious user was present.
     */
    get channelId(): string;
    /**
     * The unique ID of this low-trust event.
     */
    get lowTrustId(): string;
    /**
     * The user ID of the moderator.
     */
    get moderatorId(): string;
    /**
     * The name of the moderator.
     */
    get moderatorName(): string;
    /**
     * The display name of the moderator.
     */
    get moderatorDisplayName(): string;
    /**
     * The date of when the treatment was updated for the suspicious user.
     */
    get updateDate(): Date;
    /**
     * The user ID of the suspicious user.
     */
    get userId(): string;
    /**
     * The name of the suspicious user.
     */
    get userName(): string;
    /**
     * The display name of the suspicious user.
     */
    get userDisplayName(): string;
    /**
     * The treatment set for the suspicious user.
     */
    get treatment(): PubSubLowTrustUserTreatmentType;
    /**
     * User types (if any) that apply to the suspicious user.
     */
    get types(): PubSubLowTrustUserType[];
    /**
     * The ban evasion likelihood value that as been applied to the user automatically by Twitch.
     *
     * Can be an empty string if Twitch did not apply any evasion value.
     */
    get banEvasionEvaluation(): PubSubLowTrustUserBanEvasionEvaluationType;
    /**
     * The date for the first time the suspicious user was automatically evaluated by Twitch.
     *
     * Will be `null` if {@link PubSubLowTrustUserChatMessage#banEvasionEvaluation} is empty.
     */
    get evaluationDate(): Date | null;
    /**
     * A list of channel IDs where the suspicious user is also banned.
     */
    get sharedBanChannelIds(): string[];
    /**
     * The ID of the chat message.
     */
    get messageId(): string;
    /**
     * Plain text of the message sent.
     */
    get content(): string;
    /**
     * Fragments contained in the message, including emotes.
     */
    get fragments(): PubSubLowTrustUserChatMessageContentFragmentData[];
    /**
     * Date when the chat message was sent.
     */
    get sendDate(): Date;
}
//# sourceMappingURL=PubSubLowTrustUserChatMessage.d.ts.map