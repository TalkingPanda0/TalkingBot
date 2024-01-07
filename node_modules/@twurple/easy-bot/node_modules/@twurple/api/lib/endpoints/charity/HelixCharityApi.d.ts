import { type UserIdResolvable } from '@twurple/common';
import { type HelixPaginatedResult } from '../../utils/pagination/HelixPaginatedResult';
import { type HelixForwardPagination } from '../../utils/pagination/HelixPagination';
import { BaseApi } from '../BaseApi';
import { HelixCharityCampaign } from './HelixCharityCampaign';
import { HelixCharityCampaignDonation } from './HelixCharityCampaignDonation';
/**
 * The Helix API methods that deal with charity campaigns.
 *
 * Can be accessed using `client.charity` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const charityCampaign = await api.charity.getCharityCampaign('125328655');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Charity Campaigns
 */
export declare class HelixCharityApi extends BaseApi {
    /**
     * Gets information about the charity campaign that a broadcaster is running.
     * Returns null if the specified broadcaster has no active charity campaign.
     *
     * @param broadcaster The broadcaster to get charity campaign information about.
     */
    getCharityCampaign(broadcaster: UserIdResolvable): Promise<HelixCharityCampaign>;
    /**
     * Gets the list of donations that users have made to the broadcaster’s active charity campaign.
     *
     * @param broadcaster The broadcaster to get charity campaign donation information about.
     * @param pagination
     *
     * @expandParams
     */
    getCharityCampaignDonations(broadcaster: UserIdResolvable, pagination?: HelixForwardPagination): Promise<HelixPaginatedResult<HelixCharityCampaignDonation>>;
}
//# sourceMappingURL=HelixCharityApi.d.ts.map