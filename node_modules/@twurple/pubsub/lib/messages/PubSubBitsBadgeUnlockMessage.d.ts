import { DataObject } from '@twurple/common';
import { type PubSubBitsBadgeUnlockMessageData } from './PubSubBitsBadgeUnlockMessage.external';
/**
 * A message that informs about a user unlocking a new bits badge.
 */
export declare class PubSubBitsBadgeUnlockMessage extends DataObject<PubSubBitsBadgeUnlockMessageData> {
    /**
     * The ID of the user that unlocked the badge.
     */
    get userId(): string | undefined;
    /**
     * The name of the user that unlocked the badge.
     */
    get userName(): string | undefined;
    /**
     * The full message that was sent with the notification.
     */
    get message(): string;
    /**
     * The new badge tier.
     */
    get badgeTier(): number;
}
//# sourceMappingURL=PubSubBitsBadgeUnlockMessage.d.ts.map