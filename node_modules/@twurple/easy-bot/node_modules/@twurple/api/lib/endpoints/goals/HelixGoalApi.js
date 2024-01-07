"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixGoalApi = void 0;
const tslib_1 = require("tslib");
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const BaseApi_1 = require("../BaseApi");
const HelixGoal_1 = require("./HelixGoal");
/**
 * The Helix API methods that deal with creator goals.
 *
 * Can be accessed using `client.goals` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const { data: goals } = await api.helix.goals.getGoals('61369223');
 *
 * @meta category helix
 * @meta categorizedTitle Goals
 */
let HelixGoalApi = class HelixGoalApi extends BaseApi_1.BaseApi {
    async getGoals(broadcaster) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'goals',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:read:goals'],
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        });
        return result.data.map(data => new HelixGoal_1.HelixGoal(data, this._client));
    }
};
HelixGoalApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixGoalApi')
], HelixGoalApi);
exports.HelixGoalApi = HelixGoalApi;
