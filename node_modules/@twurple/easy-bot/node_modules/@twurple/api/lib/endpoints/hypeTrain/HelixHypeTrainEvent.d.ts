import { DataObject } from '@twurple/common';
import { type HelixEventData } from '../../interfaces/endpoints/generic.external';
import { type HelixHypeTrainEventData, type HelixHypeTrainEventType } from '../../interfaces/endpoints/hypeTrain.external';
import type { HelixUser } from '../user/HelixUser';
import { HelixHypeTrainContribution } from './HelixHypeTrainContribution';
/**
 * A Hype Train event.
 */
export declare class HelixHypeTrainEvent extends DataObject<HelixEventData<HelixHypeTrainEventData, HelixHypeTrainEventType>> {
    /**
     * The unique ID of the Hype Train event.
     */
    get eventId(): string;
    /**
     * The type of the Hype Train event.
     */
    get eventType(): HelixHypeTrainEventType;
    /**
     * The date of the Hype Train event.
     */
    get eventDate(): Date;
    /**
     * The version of the Hype Train event.
     */
    get eventVersion(): string;
    /**
     * The unique ID of the Hype Train.
     */
    get id(): string;
    /**
     * The user ID of the broadcaster where the Hype Train event was triggered.
     */
    get broadcasterId(): string;
    /**
     * Gets more information about the broadcaster where the Hype Train event was triggered.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The level of the Hype Train event.
     */
    get level(): number;
    /**
     * The time when the Hype Train started.
     */
    get startDate(): Date;
    /**
     * The time when the Hype Train is set to expire.
     */
    get expiryDate(): Date;
    /**
     * The time when the Hype Train cooldown will end.
     */
    get cooldownDate(): Date;
    /**
     * The total amount of progress points of the Hype Train event.
     */
    get total(): number;
    /**
     * The progress points goal to reach the next Hype Train level.
     */
    get goal(): number;
    /**
     * The last contribution to the Hype Train event.
     */
    get lastContribution(): HelixHypeTrainContribution;
    /**
     * Array list of the top contributions to the Hype Train event for bits and subs.
     */
    get topContributions(): HelixHypeTrainContribution[];
}
//# sourceMappingURL=HelixHypeTrainEvent.d.ts.map