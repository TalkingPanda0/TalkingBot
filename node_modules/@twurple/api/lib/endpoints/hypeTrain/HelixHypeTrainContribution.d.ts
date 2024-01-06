import { DataObject } from '@twurple/common';
import { type HelixHypeTrainContributionData, type HelixHypeTrainContributionType } from '../../interfaces/endpoints/hypeTrain.external';
import type { HelixUser } from '../user/HelixUser';
/**
 * A Hype Train contributor.
 */
export declare class HelixHypeTrainContribution extends DataObject<HelixHypeTrainContributionData> {
    /**
     * The ID of the user contributing to the Hype Train.
     */
    get userId(): string;
    /**
     * Gets additional information about the user contributing to the Hype Train.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The Hype Train event type.
     */
    get type(): HelixHypeTrainContributionType;
    /**
     * The total contribution amount in subs or bits.
     */
    get total(): number;
}
//# sourceMappingURL=HelixHypeTrainContribution.d.ts.map