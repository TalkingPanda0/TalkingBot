import { DataObject } from '@twurple/common';
import { type PubSubRedemptionMessageData, type PubSubRedemptionMessageImageData, type PubSubRedemptionStatus } from './PubSubRedemptionMessage.external';
/**
 * A message that informs about a user redeeming a custom channel points reward.
 */
export declare class PubSubRedemptionMessage extends DataObject<PubSubRedemptionMessageData> {
    /**
     * The internal redemption ID.
     */
    get id(): string;
    /**
     * The ID of the user that redeemed the reward.
     */
    get userId(): string;
    /**
     * The name of the user that redeemed the reward.
     */
    get userName(): string;
    /**
     * The display name of the user that redeemed the reward.
     */
    get userDisplayName(): string;
    /**
     * The ID of the channel where the reward was redeemed.
     */
    get channelId(): string;
    /**
     * The date when the reward was redeemed.
     */
    get redemptionDate(): Date;
    /**
     * The ID of the reward.
     */
    get rewardId(): string;
    /**
     * The title of the reward.
     */
    get rewardTitle(): string;
    /**
     * The prompt of the reward.
     */
    get rewardPrompt(): string;
    /**
     * The cost of the reward, in channel points.
     */
    get rewardCost(): number;
    /**
     * Whether the reward gets added to the request queue.
     */
    get rewardIsQueued(): boolean;
    /**
     * The image set associated with the reward.
     */
    get rewardImage(): PubSubRedemptionMessageImageData;
    /**
     * The default image set associated with the reward.
     */
    get defaultImage(): PubSubRedemptionMessageImageData;
    /**
     * The full message that was sent with the notification.
     */
    get message(): string;
    /**
     * The status of the redemption.
     */
    get status(): PubSubRedemptionStatus;
}
//# sourceMappingURL=PubSubRedemptionMessage.d.ts.map