import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubUserUpdateEventData } from './EventSubUserUpdateEvent.external';
/**
 * An EventSub event representing updating their account details.
 */
export declare class EventSubUserUpdateEvent extends DataObject<EventSubUserUpdateEventData> {
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
     * The user's profile description.
     */
    get userDescription(): string;
    /**
     * The user's email address.
     *
     * This is `null` if you are not authorized to read the email address,
     * i.e. you have never successfully requested the scope `user:read:email` from the user.
     */
    get userEmail(): string | null;
    /**
     * Whether the user's email address has been verified by Twitch.
     *
     * This is `null` if you are not authorized to read the email address,
     * i.e. you have never successfully requested the scope `user:read:email` from the user.
     */
    get userEmailIsVerified(): boolean | null;
    /**
     * Gets more information about the user.
     */
    getUser(): Promise<HelixUser>;
}
//# sourceMappingURL=EventSubUserUpdateEvent.d.ts.map