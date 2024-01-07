import { DataObject } from '@twurple/common';
import { type PubSubLowTrustUserBanEvasionEvaluationType, type PubSubLowTrustUserTreatmentType, type PubSubLowTrustUserType } from './common/PubSubLowTrustUserContentBase.external';
import { type PubSubLowTrustUserTreatmentMessageData } from './PubSubLowTrustUserTreatmentMessage.external';
/**
 * A message that informs about treatment against a low-trust user.
 */
export declare class PubSubLowTrustUserTreatmentMessage extends DataObject<PubSubLowTrustUserTreatmentMessageData> {
    /**
     * The ID of the channel where the suspicious user was present.
     */
    get channelId(): string;
    /**
     * The ID for the suspicious user entry, which is a combination of the channel ID where the treatment was
     * updated and the user ID of the suspicious user.
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
     * The user ID of the suspicious user
     */
    get userId(): string;
    /**
     * The name of the suspicious user.
     */
    get userName(): string;
    /**
     * The treatment set for the suspicious user.
     */
    get treatment(): PubSubLowTrustUserTreatmentType;
    /**
     * User types (if any) that apply to the suspicious user.
     */
    get types(): PubSubLowTrustUserType[];
    /**
     * A ban evasion likelihood value that as been applied to the user automatically by Twitch.
     *
     * Can be an empty string if Twitch did not apply any evasion value.
     */
    get banEvasionEvaluation(): PubSubLowTrustUserBanEvasionEvaluationType;
    /**
     * The date for the first time the suspicious user was automatically evaluated by Twitch.
     *
     * Will be `null` if {@link PubSubLowTrustUserTreatmentMessage#banEvasionEvaluation} is empty.
     */
    get evaluationDate(): Date | null;
}
//# sourceMappingURL=PubSubLowTrustUserTreatmentMessage.d.ts.map