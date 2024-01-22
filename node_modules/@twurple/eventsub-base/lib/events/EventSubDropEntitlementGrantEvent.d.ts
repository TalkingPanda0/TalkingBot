import { type HelixGame, type HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubDropEntitlementGrantEventData } from './EventSubDropEntitlementGrantEvent.external';
/**
 * An EventSub event representing a drop entitlement grant.
 */
export declare class EventSubDropEntitlementGrantEvent extends DataObject<EventSubDropEntitlementGrantEventData> {
    /**
     * The ID of the organization.
     */
    get organizationId(): string;
    /**
     * The ID of the category/game.
     */
    get categoryId(): string;
    /**
     * The name of the category/game.
     */
    get categoryName(): string;
    /**
     * Gets more information about the category/game.
     */
    getCategory(): Promise<HelixGame>;
    /**
     * The ID of the campaign.
     */
    get campaignId(): string;
    /**
     * The ID of the entitled user.
     */
    get userId(): string;
    /**
     * The name of the entitled user.
     */
    get userName(): string;
    /**
     * The display name of the entitled user.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the entitled user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The ID of the entitlement.
     */
    get entitlementId(): string;
    /**
     * The ID of the reward.
     */
    get rewardId(): string;
    /**
     * The date when the entitlement was granted.
     */
    get grantDate(): Date;
}
//# sourceMappingURL=EventSubDropEntitlementGrantEvent.d.ts.map