import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelRedemptionUpdateEventData } from './EventSubChannelRedemptionUpdateEvent.external';
/**
 * An EventSub event representing a Channel Points redemption being updated.
 */
export declare class EventSubChannelRedemptionUpdateEvent extends DataObject<EventSubChannelRedemptionUpdateEventData> {
    /**
     * The ID of the redemption being updated.
     */
    get id(): string;
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the user.
     */
    get userId(): string;
    /**
     * The name of the user.
     */
    get userName(): string;
    /**
     * The display name of the user.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The input text given by the user.
     *
     * If there is no input to be given, this is an empty string.
     */
    get input(): string;
    /**
     * The status of the redemption.
     */
    get status(): string;
    /**
     * The ID of the reward that was redeemed.
     */
    get rewardId(): string;
    /**
     * The title of the reward that was redeemed.
     */
    get rewardTitle(): string;
    /**
     * The cost of the reward that was redeemed.
     */
    get rewardCost(): number;
    /**
     * The description of the reward that was redeemed.
     */
    get rewardPrompt(): string;
    /**
     * The time when the user redeemed the reward.
     */
    get redemptionDate(): Date;
}
//# sourceMappingURL=EventSubChannelRedemptionUpdateEvent.d.ts.map