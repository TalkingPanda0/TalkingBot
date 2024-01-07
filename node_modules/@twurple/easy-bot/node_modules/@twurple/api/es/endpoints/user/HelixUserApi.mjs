import { __decorate } from "tslib";
import { Enumerable, mapNullable } from '@d-fischer/shared-utils';
import { createBroadcasterQuery } from '@twurple/api-call';
import { extractUserId, extractUserName, HellFreezesOverError, rtfm, } from '@twurple/common';
import { createSingleKeyQuery } from "../../interfaces/endpoints/generic.external.mjs";
import { createUserBlockCreateQuery, createUserBlockDeleteQuery, } from "../../interfaces/endpoints/user.external.mjs";
import { HelixRequestBatcher } from "../../utils/HelixRequestBatcher.mjs";
import { HelixPaginatedRequest } from "../../utils/pagination/HelixPaginatedRequest.mjs";
import { createPaginatedResult } from "../../utils/pagination/HelixPaginatedResult.mjs";
import { createPaginationQuery } from "../../utils/pagination/HelixPagination.mjs";
import { BaseApi } from "../BaseApi.mjs";
import { HelixInstalledExtensionList } from "./extensions/HelixInstalledExtensionList.mjs";
import { HelixUserExtension } from "./extensions/HelixUserExtension.mjs";
import { HelixPrivilegedUser } from "./HelixPrivilegedUser.mjs";
import { HelixUser } from "./HelixUser.mjs";
import { HelixUserBlock } from "./HelixUserBlock.mjs";
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
let HelixUserApi = class HelixUserApi extends BaseApi {
    constructor() {
        super(...arguments);
        /** @internal */
        this._getUserByIdBatcher = new HelixRequestBatcher({
            url: 'users',
        }, 'id', 'id', this._client, (data) => new HelixUser(data, this._client));
        /** @internal */
        this._getUserByNameBatcher = new HelixRequestBatcher({
            url: 'users',
        }, 'login', 'login', this._client, (data) => new HelixUser(data, this._client));
    }
    /**
     * Gets the user data for the given list of user IDs.
     *
     * @param userIds The user IDs you want to look up.
     */
    async getUsersByIds(userIds) {
        return await this._getUsers('id', userIds.map(extractUserId));
    }
    /**
     * Gets the user data for the given list of usernames.
     *
     * @param userNames The usernames you want to look up.
     */
    async getUsersByNames(userNames) {
        return await this._getUsers('login', userNames.map(extractUserName));
    }
    /**
     * Gets the user data for the given user ID.
     *
     * @param user The user ID you want to look up.
     */
    async getUserById(user) {
        const userId = extractUserId(user);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users',
            userId,
            query: {
                id: userId,
            },
        });
        return mapNullable(result.data[0], data => new HelixUser(data, this._client));
    }
    /**
     * Gets the user data for the given user ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The user ID you want to look up.
     */
    async getUserByIdBatched(user) {
        return await this._getUserByIdBatcher.request(extractUserId(user));
    }
    /**
     * Gets the user data for the given username.
     *
     * @param userName The username you want to look up.
     */
    async getUserByName(userName) {
        const users = await this._getUsers('login', [extractUserName(userName)]);
        return users.length ? users[0] : null;
    }
    /**
     * Gets the user data for the given username, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The username you want to look up.
     */
    async getUserByNameBatched(user) {
        return await this._getUserByNameBatcher.request(extractUserName(user));
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
            userId: extractUserId(user),
            scopes: withEmail ? ['user:read:email'] : undefined,
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!((_a = result.data) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new HellFreezesOverError('Could not get authenticated user');
        }
        return new HelixPrivilegedUser(result.data[0], this._client);
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
            userId: extractUserId(user),
            scopes: ['user:edit'],
            query: {
                description: data.description,
            },
        });
        return new HelixPrivilegedUser(result.data[0], this._client);
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
            userId: extractUserId(user),
            scopes: ['user:read:blocked_users'],
            query: {
                ...createBroadcasterQuery(user),
                ...createPaginationQuery(pagination),
            },
        });
        return createPaginatedResult(result, HelixUserBlock, this._client);
    }
    /**
     * Creates a paginator for users blocked by the given user.
     *
     * @param user The user to get blocks for.
     */
    getBlocksPaginated(user) {
        return new HelixPaginatedRequest({
            url: 'users/blocks',
            userId: extractUserId(user),
            scopes: ['user:read:blocked_users'],
            query: createBroadcasterQuery(user),
        }, this._client, data => new HelixUserBlock(data, this._client));
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
            userId: extractUserId(broadcaster),
            scopes: ['user:manage:blocked_users'],
            query: createUserBlockCreateQuery(target, additionalInfo),
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
            userId: extractUserId(broadcaster),
            scopes: ['user:manage:blocked_users'],
            query: createUserBlockDeleteQuery(target),
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
            userId: extractUserId(broadcaster),
            scopes: withInactive ? ['user:edit:broadcast'] : ['user:read:broadcast', 'user:edit:broadcast'],
        });
        return result.data.map(data => new HelixUserExtension(data));
    }
    /**
     * Gets a list of all installed extensions for the given user.
     *
     * @param user The user to get the installed extensions for.
     * @param withDev Whether to include extensions that are in development.
     */
    async getActiveExtensions(user, withDev = false) {
        const userId = extractUserId(user);
        const result = await this._client.callApi({
            type: 'helix',
            url: 'users/extensions',
            userId,
            scopes: withDev ? ['user:read:broadcast', 'user:edit:broadcast'] : undefined,
            query: createSingleKeyQuery('user_id', userId),
        });
        return new HelixInstalledExtensionList(result.data);
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
            userId: extractUserId(broadcaster),
            scopes: ['user:edit:broadcast'],
            jsonBody: { data },
        });
        return new HelixInstalledExtensionList(result.data);
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
        return result.data.map(userData => new HelixUser(userData, this._client));
    }
};
__decorate([
    Enumerable(false)
], HelixUserApi.prototype, "_getUserByIdBatcher", void 0);
__decorate([
    Enumerable(false)
], HelixUserApi.prototype, "_getUserByNameBatcher", void 0);
HelixUserApi = __decorate([
    rtfm('api', 'HelixUserApi')
], HelixUserApi);
export { HelixUserApi };
