import { type HelixUser } from '@twurple/api';
import { type UserNotice } from '@twurple/chat';
/**
 * An event representing a user subscribing to a channel.
 *
 * @meta category events
 */
export declare class SubEvent {
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
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
     * Gets more information about the user subscribing to the channel.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The plan of the subscription.
     */
    get plan(): string;
    /**
     * The display name of the plan of the subscription.
     */
    get planName(): string;
    /**
     * Whether the subscription was "paid" for using Prime Gaming.
     */
    get isPrime(): boolean;
    /**
     * The number of total months of subscriptions for the channel.
     */
    get months(): number;
    /**
     * The number of consecutive months of subscriptions for the channel,
     * or `null` if the user resubscribing does not choose to share that information.
     */
    get streak(): number | null;
    /**
     * The message sent with the subscription, or `null` if there is none.
     */
    get message(): string | null;
    /**
     * The full object that contains all the message information.
     */
    get messageObject(): UserNotice;
    /**
     * Whether the announced subscription is a continuation of a previously gifted multi-month subscription.
     */
    get wasGift(): boolean;
    /**
     * Whether the announced subscription is a continuation of a previously anonymously gifter multi-month subscription.
     */
    get wasAnonymousGift(): boolean;
    /**
     * The ID of the user who originally gifted the current multi-month subscription,
     * or `null` if they were anonymous or the subscription is not a continuation of a multi-month subscription.
     */
    get originalGifterId(): string | null;
    /**
     * The name of the user who originally gifted the current multi-month subscription,
     * or `null` if they were anonymous or the subscription is not a continuation of a multi-month subscription.
     */
    get originalGifterName(): string | null;
    /**
     * The display name of the user who originally gifted the current multi-month subscription,
     * or `null` if they were anonymous or the subscription is not a continuation of a multi-month subscription.
     */
    get originalGifterDisplayName(): string | null;
    /**
     * Gets more information about the user who originally gifted the current multi-month subscription,
     * or `null` if they were anonymous or the subscription is not a continuation of a multi-month subscription.
     */
    getOriginalGifter(): Promise<HelixUser | null>;
    /**
     * The total duration of the current multi-month subscription,
     * or `null` if the subscription is not a continuation of a multi-month subscription.
     */
    get originalGiftDuration(): number | null;
    /**
     * The number of the month out of the total gift duration that was just redeemed,
     * or `null` if the subscription is not a continuation of a multi-month subscription.
     */
    get giftRedeemedMonth(): number | null;
}
//# sourceMappingURL=SubEvent.d.ts.map