import { __decorate } from "tslib";
import { createBroadcasterQuery } from '@twurple/api-call';
import { extractUserId, rtfm } from '@twurple/common';
import { HelixPaginatedRequestWithTotal } from "../../utils/pagination/HelixPaginatedRequestWithTotal.mjs";
import { HelixSubscription } from "./HelixSubscription.mjs";
/**
 * A special case of {@link HelixPaginatedRequestWithTotal}
 * with support for fetching the total sub points of a broadcaster.
 *
 * @inheritDoc
 */
let HelixPaginatedSubscriptionsRequest = class HelixPaginatedSubscriptionsRequest extends HelixPaginatedRequestWithTotal {
    /** @internal */
    constructor(broadcaster, client) {
        super({
            url: 'subscriptions',
            scopes: ['channel:read:subscriptions'],
            userId: extractUserId(broadcaster),
            query: createBroadcasterQuery(broadcaster),
        }, client, data => new HelixSubscription(data, client));
    }
    /**
     * Gets the total sub points of the broadcaster.
     */
    async getPoints() {
        var _a;
        const data = (_a = this._currentData) !== null && _a !== void 0 ? _a : (await this._fetchData({ query: { after: undefined } }));
        return data.points;
    }
};
HelixPaginatedSubscriptionsRequest = __decorate([
    rtfm('api', 'HelixPaginatedSubscriptionsRequest')
], HelixPaginatedSubscriptionsRequest);
export { HelixPaginatedSubscriptionsRequest };
