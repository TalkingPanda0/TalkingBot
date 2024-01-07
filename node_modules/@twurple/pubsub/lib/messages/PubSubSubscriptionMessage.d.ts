import { DataObject } from '@twurple/common';
import { type PubSubChatMessage } from './PubSubMessage.external';
import { type PubSubSubscriptionMessageData } from './PubSubSubscriptionMessage.external';
/**
 * A message that informs about a user subscribing to a channel.
 */
export declare class PubSubSubscriptionMessage extends DataObject<PubSubSubscriptionMessageData> {
    /**
     * The ID of the user subscribing to the channel.
     */
    get userId(): string;
    /**
     * The name of the user subscribing to the channel.
     */
    get userName(): string;
    /**
     * The display name of the user subscribing to the channel.
     */
    get userDisplayName(): string;
    /**
     * The streak amount of months the user has been subscribed for.
     *
     * Returns 0 if a gift sub or the streaks months.
     */
    get streakMonths(): number;
    /**
     * The cumulative amount of months the user has been subscribed for.
     *
     * Returns the months if a gift sub or the cumulative months.
     */
    get cumulativeMonths(): number;
    /**
     * The cumulative amount of months the user has been subscribed for.
     *
     * Returns the months if a gift sub or the cumulative months.
     */
    get months(): number;
    /**
     * The time the user subscribed.
     */
    get time(): Date;
    /**
     * The message sent with the subscription.
     *
     * Returns null if the subscription is a gift subscription.
     */
    get message(): PubSubChatMessage | null;
    /**
     * The plan of the subscription.
     */
    get subPlan(): string;
    /**
     * Whether the subscription is a resub.
     */
    get isResub(): boolean;
    /**
     * Whether the subscription is a gift.
     */
    get isGift(): boolean;
    /**
     * Whether the subscription is from an anonymous gifter.
     */
    get isAnonymous(): boolean;
    /**
     * The ID of the user gifting the subscription.
     *
     * Returns null if the subscription is not a gift.
     */
    get gifterId(): string | null;
    /**
     * The name of the user gifting the subscription.
     *
     * Returns null if the subscription is not a gift.
     */
    get gifterName(): string | null;
    /**
     * The display name of the user gifting the subscription.
     *
     * Returns null if the subscription is not a gift.
     */
    get gifterDisplayName(): string | null;
    /**
     * The duration of subscription, in months.
     *
     * This refers to first-time subscriptions, auto-renewal subscriptions, re-subscriptions, or gifted subscriptions.
     */
    get duration(): number;
}
//# sourceMappingURL=PubSubSubscriptionMessage.d.ts.map