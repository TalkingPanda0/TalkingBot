import { type HelixSubscriptionData } from '../../interfaces/endpoints/subscription.external';
import { HelixPaginatedRequestWithTotal } from '../../utils/pagination/HelixPaginatedRequestWithTotal';
import { HelixSubscription } from './HelixSubscription';
/**
 * A special case of {@link HelixPaginatedRequestWithTotal}
 * with support for fetching the total sub points of a broadcaster.
 *
 * @inheritDoc
 */
export declare class HelixPaginatedSubscriptionsRequest extends HelixPaginatedRequestWithTotal<HelixSubscriptionData, HelixSubscription> {
    /**
     * Gets the total sub points of the broadcaster.
     */
    getPoints(): Promise<number>;
}
//# sourceMappingURL=HelixPaginatedSubscriptionsRequest.d.ts.map