import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubUserAuthorizationRevokeEventData } from './EventSubUserAuthorizationRevokeEvent.external';
/**
 * An EventSub event representing a user revoking authorization for an application.
 */
export declare class EventSubUserAuthorizationRevokeEvent extends DataObject<EventSubUserAuthorizationRevokeEventData> {
    /**
     * The ID of the user who revoked their authorization.
     */
    get userId(): string;
    /**
     * The name of the user who revoked their authorization.
     *
     * This is `null` if the user no longer exists.
     */
    get userName(): string | null;
    /**
     * The display name of the user who revoked their authorization.
     *
     * This is `null` if the user no longer exists.
     */
    get userDisplayName(): string | null;
    /**
     * Gets more information about the user.
     */
    getUser(): Promise<HelixUser | null>;
    /**
     * The Client ID of the application that the user revoked authorization for.
     */
    get clientId(): string;
}
//# sourceMappingURL=EventSubUserAuthorizationRevokeEvent.d.ts.map