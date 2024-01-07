import { type HelixEventSubSubscriptionData } from '../../interfaces/endpoints/eventSub.external';
import { HelixPaginatedRequestWithTotal } from '../../utils/pagination/HelixPaginatedRequestWithTotal';
import { HelixEventSubSubscription } from './HelixEventSubSubscription';
/**
 * A special case of {@link HelixPaginatedRequestWithTotal} with support for fetching the total cost and cost limit
 * of EventSub subscriptions.
 *
 * @inheritDoc
 */
export declare class HelixPaginatedEventSubSubscriptionsRequest extends HelixPaginatedRequestWithTotal<HelixEventSubSubscriptionData, HelixEventSubSubscription> {
    /**
     * Gets the total cost of EventSub subscriptions.
     */
    getTotalCost(): Promise<number>;
    /**
     * Gets the cost limit of EventSub subscriptions.
     */
    getMaxTotalCost(): Promise<number>;
}
//# sourceMappingURL=HelixPaginatedEventSubSubscriptionsRequest.d.ts.map