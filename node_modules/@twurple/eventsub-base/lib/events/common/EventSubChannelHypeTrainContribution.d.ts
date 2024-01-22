import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelHypeTrainContributionData, type EventSubChannelHypeTrainContributionType } from './EventSubChannelHypeTrainContribution.external';
export declare class EventSubChannelHypeTrainContribution extends DataObject<EventSubChannelHypeTrainContributionData> {
    /**
     * The contributor's ID.
     */
    get userId(): string;
    /**
     * The contributor's user name.
     */
    get userName(): string;
    /**
     * The contributor's display name.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the contributor.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The type of the contribution.
     */
    get type(): EventSubChannelHypeTrainContributionType;
    /**
     * The contributor's total contribution.
     */
    get total(): number;
}
//# sourceMappingURL=EventSubChannelHypeTrainContribution.d.ts.map