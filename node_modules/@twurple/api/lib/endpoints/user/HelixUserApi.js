"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixUserApi = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const user_external_1 = require("../../interfaces/endpoints/user.external");
const HelixRequestBatcher_1 = require("../../utils/HelixRequestBatcher");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixPaginatedResult_1 = require("../../utils/pagination/HelixPaginatedResult");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixInstalledExtensionList_1 = require("./extensions/HelixInstalledExtensionList");
const HelixUserExtension_1 = require("./extensions/HelixUserExtension");
const HelixPrivilegedUser_1 = require("./HelixPrivilegedUser");
const HelixUser_1 = require("./HelixUser");
const HelixUserBlock_1 = require("./HelixUserBlock");
/**
 * The Helix API methods that deal with users.
 *
 * Can be accessed using `client.users` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const user = await api.users.getUserById('125328655');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Users
 */
let HelixUserApi = class HelixUserApi extends BaseApi_1.BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */
        this._getUserByIdBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'users',
        }, 'id', 'id', this._client, (data) => new HelixUser_1.HelixUser(data, this._client));
        /** @internal */
        this._getUserByNameBatcher = new HelixRequestBatcher_1.HelixRequestBatcher({
            url: 'users',
        }, 'login', 'login', this._client, (data) => new HelixUser_1.HelixUser(data, this._client));
    }
    /**
     * Gets the user data for the given list of user IDs.
     *
     * @param userIds The user IDs you want to look up.
     */
    async getUsersByIds(userIds) {
        return await this._getUsers('id', userIds.map(common_1.extractUserId));
    }
    /**
     * Gets the user data for the given list of usernames.
     *
     * @param userNames The usernames you want to look up.
     */
    async getUsersByNames(userNames) {
        return await this._getUsers('login', userNames.map(common_1.extractUserName));
    }
    /**
     * Gets the user data for the given user ID.
     *
     * @param user The user ID you want to look up.
     */
    async getUserById(user) {
        const userId = (0, common_1.extractUserId)(user);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users',
            userId,
            query: {
                id: userId,
            },
        });
        return (0, shared_utils_1.mapNullable)(result.data[0], data => new HelixUser_1.HelixUser(data, this._client));
    }
    /**
     * Gets the user data for the given user ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The user ID you want to look up.
     */
    async getUserByIdBatched(user) {
        return await this._getUserByIdBatcher.request((0, common_1.extractUserId)(user));
    }
    /**
     * Gets the user data for the given username.
     *
     * @param userName The username you want to look up.
     */
    async getUserByName(userName) {
        const users = await this._getUsers('login', [(0, common_1.extractUserName)(userName)]);
        return users.length ? users[0] : null;
    }
    /**
     * Gets the user data for the given username, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The username you want to look up.
     */
    async getUserByNameBatched(user) {
        return await this._getUserByNameBatcher.request((0, common_1.extractUserName)(user));
    }
    /**
     * Gets the user data of the given authenticated user.
     *
     * @param user The user to get data for.
     * @param withEmail Whether you need the user's email address.
     */
    async getAuthenticatedUser(user, withEmail = false) {
        var _a;
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users',
            forceType: 'user',
            userId: (0, common_1.extractUserId)(user),
            scopes: withEmail ? ['user:read:email'] : undefined,
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!((_a = result.data) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new common_1.HellFreezesOverError('Could not get authenticated user');
        }
        return new HelixPrivilegedUser_1.HelixPrivilegedUser(result.data[0], this._client);
    }
    /**
     * Updates the given authenticated user's data.
     *
     * @param user The user to update.
     * @param data The data to update.
     */
    async updateAuthenticatedUser(user, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users',
            method: 'PUT',
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:edit'],
            query: {
                description: data.description,
            },
        });
        return new HelixPrivilegedUser_1.HelixPrivilegedUser(result.data[0], this._client);
    }
    /**
     * Gets a list of users blocked by the given user.
     *
     * @param user The user to get blocks for.
     * @param pagination
     *
     * @expandParams
     */
    async getBlocks(user, pagination) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users/blocks',
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:read:blocked_users'],
            query: {
                ...(0, api_call_1.createBroadcasterQuery)(user),
                ...(0, HelixPagination_1.createPaginationQuery)(pagination),
            },
        });
        return (0, HelixPaginatedResult_1.createPaginatedResult)(result, HelixUserBlock_1.HelixUserBlock, this._client);
    }
    /**
     * Creates a paginator for users blocked by the given user.
     *
     * @param user The user to get blocks for.
     */
    getBlocksPaginated(user) {
        return new HelixPaginatedRequest_1.HelixPaginatedRequest({
            url: 'users/blocks',
            userId: (0, common_1.extractUserId)(user),
            scopes: ['user:read:blocked_users'],
            query: (0, api_call_1.createBroadcasterQuery)(user),
        }, this._client, data => new HelixUserBlock_1.HelixUserBlock(data, this._client));
    }
    /**
     * Blocks the given user.
     *
     * @param broadcaster The user to add the block to.
     * @param target The user to block.
     * @param additionalInfo Additional info to give context to the block.
     *
     * @expandParams
     */
    async createBlock(broadcaster, target, additionalInfo = {}) {
        await this._client.callApi({
            type: 'helix',
            url: 'users/blocks',
            method: 'PUT',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['user:manage:blocked_users'],
            query: (0, user_external_1.createUserBlockCreateQuery)(target, additionalInfo),
        });
    }
    /**
     * Unblocks the given user.
     *
     * @param broadcaster The user to remove the block from.
     * @param target The user to unblock.
     */
    async deleteBlock(broadcaster, target) {
        await this._client.callApi({
            type: 'helix',
            url: 'users/blocks',
            method: 'DELETE',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['user:manage:blocked_users'],
            query: (0, user_external_1.createUserBlockDeleteQuery)(target),
        });
    }
    /**
     * Gets a list of all extensions for the given authenticated user.
     *
     * @param broadcaster The broadcaster to get the list of extensions for.
     * @param withInactive Whether to include inactive extensions.
     */
    async getExtensionsForAuthenticatedUser(broadcaster, withInactive = false) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users/extensions/list',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: withInactive ? ['user:edit:broadcast'] : ['user:read:broadcast', 'user:edit:broadcast'],
        });
        return result.data.map(data => new HelixUserExtension_1.HelixUserExtension(data));
    }
    /**
     * Gets a list of all installed extensions for the given user.
     *
     * @param user The user to get the installed extensions for.
     * @param withDev Whether to include extensions that are in development.
     */
    async getActiveExtensions(user, withDev = false) {
        const userId = (0, common_1.extractUserId)(user);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users/extensions',
            userId,
            scopes: withDev ? ['user:read:broadcast', 'user:edit:broadcast'] : undefined,
            query: (0, generic_external_1.createSingleKeyQuery)('user_id', userId),
        });
        return new HelixInstalledExtensionList_1.HelixInstalledExtensionList(result.data);
    }
    /**
     * Updates the installed extensions for the given authenticated user.
     *
     * @param broadcaster The user to update the installed extensions for.
     * @param data The extension installation payload.
     *
     * The format is shown on the [Twitch documentation](https://dev.twitch.tv/docs/api/reference#update-user-extensions).
     * Don't use the "data" wrapper though.
     */
    async updateActiveExtensionsForAuthenticatedUser(broadcaster, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users/extensions',
            method: 'PUT',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['user:edit:broadcast'],
            jsonBody: { data },
        });
        return new HelixInstalledExtensionList_1.HelixInstalledExtensionList(result.data);
    }
    async _getUsers(lookupType, param) {
        if (param.length === 0) {
            return [];
        }
        const query = { [lookupType]: param };
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users',
            query,
        });
        return result.data.map(userData => new HelixUser_1.HelixUser(userData, this._client));
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixUserApi.prototype, "_getUserByIdBatcher", void 0);
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixUserApi.prototype, "_getUserByNameBatcher", void 0);
HelixUserApi = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixUserApi')
], HelixUserApi);
exports.HelixUserApi = HelixUserApi;
