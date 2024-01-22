import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import type { EventSubChannelShieldModeEndEventData } from './EventSubChannelShieldModeEndEvent.external';
/**
 * An EventSub event representing Shield Mode being deactivated on a broadcaster's channel.
 */
export declare class EventSubChannelShieldModeEndEvent extends DataObject<EventSubChannelShieldModeEndEventData> {
    /**
     * The ID of the broadcaster on whose channel Shield Mode was deactivated.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster on whose channel Shield Mode was deactivated.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster on whose channel Shield Mode was deactivated.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the moderator who deactivated Shield Mode.
     */
    get moderatorId(): string;
    /**
     * The name of the moderator who deactivated Shield Mode.
     */
    get moderatorName(): string;
    /**
     * The display name of the moderator who deactivated Shield Mode
     */
    get moderatorDisplayName(): string;
    /**
     * Gets more information about the moderator.
     */
    getModerator(): Promise<HelixUser>;
    /**
     * The date when Shield Mode was deactivated.
     */
    get endDate(): Date;
}
//# sourceMappingURL=EventSubChannelShieldModeEndEvent.d.ts.map