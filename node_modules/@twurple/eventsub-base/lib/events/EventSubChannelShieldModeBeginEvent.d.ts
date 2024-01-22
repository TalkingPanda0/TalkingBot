import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import type { EventSubChannelShieldModeBeginEventData } from './EventSubChannelShieldModeBeginEvent.external';
/**
 * An EventSub event representing Shield Mode being activated on a broadcaster's channel.
 */
export declare class EventSubChannelShieldModeBeginEvent extends DataObject<EventSubChannelShieldModeBeginEventData> {
    /**
     * The ID of the broadcaster on whose channel Shield Mode was activated.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster on whose channel Shield Mode was activated.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster on whose channel Shield Mode was activated.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The ID of the moderator who activated Shield Mode.
     */
    get moderatorId(): string;
    /**
     * The name of the moderator who activated Shield Mode.
     */
    get moderatorName(): string;
    /**
     * The display name of the moderator who activated Shield Mode
     */
    get moderatorDisplayName(): string;
    /**
     * Gets more information about the moderator.
     */
    getModerator(): Promise<HelixUser>;
    /**
     * The date when Shield Mode was activated.
     */
    get startDate(): Date;
}
//# sourceMappingURL=EventSubChannelShieldModeBeginEvent.d.ts.map