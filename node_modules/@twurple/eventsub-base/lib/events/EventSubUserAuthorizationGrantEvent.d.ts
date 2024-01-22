import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubUserAuthorizationGrantEventData } from './EventSubUserAuthorizationGrantEvent.external';
/**
 * An EventSub event representing a user revoking authorization for an application.
 */
export declare class EventSubUserAuthorizationGrantEvent extends DataObject<EventSubUserAuthorizationGrantEventData> {
    /**
     * The ID of the user who granted the authorization.
     */
    get userId(): string;
    /**
     * The name of the user who granted the authorization.
     */
    get userName(): string;
    /**
     * The display name of the user who granted the authorization.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The Client ID of the application that the user granted authorization to.
     */
    get clientId(): string;
}
//# sourceMappingURL=EventSubUserAuthorizationGrantEvent.d.ts.map