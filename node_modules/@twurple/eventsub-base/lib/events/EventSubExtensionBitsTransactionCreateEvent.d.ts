import type { HelixUser } from '@twurple/api';
import { DataObject } from '@twurple/common';
import { type EventSubExtensionBitsTransactionCreateEventData } from './EventSubExtensionBitsTransactionCreateEvent.external';
/**
 * An EventSub event representing a bits transaction in an extension.
 */
export declare class EventSubExtensionBitsTransactionCreateEvent extends DataObject<EventSubExtensionBitsTransactionCreateEventData> {
    /**
     * The ID of the transaction.
     */
    get id(): string;
    /**
     * The client ID of the extension.
     */
    get clientId(): string;
    /**
     * The ID of the subscribing user.
     */
    get userId(): string;
    /**
     * The name of the subscribing user.
     */
    get userName(): string;
    /**
     * The display name of the subscribing user.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the subscribing user.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
    /**
     * The name of the product the transaction is referring to.
     */
    get productName(): string;
    /**
     * The SKU of the product the transaction is referring to.
     */
    get productSku(): string;
    /**
     * The cost of the product the transaction is referring to, in Bits.
     */
    get productCost(): number;
    /**
     * Whether the product the transaction is referring to is in development.
     */
    get productInDevelopment(): boolean;
}
//# sourceMappingURL=EventSubExtensionBitsTransactionCreateEvent.d.ts.map