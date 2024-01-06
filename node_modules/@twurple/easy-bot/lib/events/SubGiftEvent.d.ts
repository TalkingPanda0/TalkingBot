import { type HelixUser } from '@twurple/api';
import { SubEvent } from './SubEvent';
/**
 * An event representing a user gifting a subscription to another user.
 *
 * @meta category events
 */
export declare class SubGiftEvent extends SubEvent {
    /**
     * The ID of the user who sent the gift.
     */
    get gifterId(): string | null;
    /**
     * The name of the user who sent the gift.
     */
    get gifterName(): string | null;
    /**
     * The display name of the user who sent the gift.
     */
    get gifterDisplayName(): string | null;
    /**
     * Gets more information about the user who sent the gift.
     */
    getGifter(): Promise<HelixUser | null>;
}
//# sourceMappingURL=SubGiftEvent.d.ts.map