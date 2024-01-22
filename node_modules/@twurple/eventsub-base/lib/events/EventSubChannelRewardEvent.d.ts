import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubChannelRewardEventData, type EventSubChannelRewardImageScale } from './EventSubChannelRewardEvent.external';
/**
 * An EventSub event representing a broadcaster adding, updating or removing a Channel Points reward for their channel.
 */
export declare class EventSubChannelRewardEvent extends DataObject<EventSubChannelRewardEventData> {
    /**
     * The ID of the reward.
     */
    get id(): string;
    /**
     * The ID of the broadcaster the reward belongs to.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster the reward belongs to.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster the reward belongs to.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the reward's broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * Whether the reward is enabled (shown to users).
     */
    get isEnabled(): boolean;
    /**
     * Whether the reward is paused. If true, users can't redeem it.
     */
    get isPaused(): boolean;
    /**
     * Whether the reward is currently in stock.
     */
    get isInStock(): boolean;
    /**
     * The title of the reward.
     */
    get title(): string;
    /**
     * The channel points cost of the reward.
     */
    get cost(): number;
    /**
     * The prompt shown to users when redeeming the reward.
     */
    get prompt(): string;
    /**
     * Whether users need to enter information when redeeming the reward.
     */
    get userInputRequired(): boolean;
    /**
     * Whether redemptions should be automatically approved.
     */
    get autoApproved(): boolean;
    /**
     * The time when the cooldown expires.
     */
    get cooldownExpiryDate(): Date | null;
    /**
     * How often the reward was already redeemed this stream.
     *
     * Only available when the stream is live and `maxRedemptionsPerStream` is set. Otherwise, this is `null`.
     */
    get redemptionsThisStream(): number | null;
    /**
     * The maximum number of redemptions of the reward per stream. `null` means no limit.
     */
    get maxRedemptionsPerStream(): number | null;
    /**
     * The maximum number of redemptions of the reward per stream for each user. `null` means no limit.
     */
    get maxRedemptionsPerUserPerStream(): number | null;
    /**
     * The cooldown between two redemptions of the reward, in seconds. `null` means no cooldown.
     */
    get globalCooldown(): number | null;
    /**
     * The background color of the reward.
     */
    get backgroundColor(): string;
    /**
     * Gets the URL of the image of the reward in the given scale.
     *
     * @param scale The scale of the image.
     */
    getImageUrl(scale: EventSubChannelRewardImageScale): string;
}
//# sourceMappingURL=EventSubChannelRewardEvent.d.ts.map