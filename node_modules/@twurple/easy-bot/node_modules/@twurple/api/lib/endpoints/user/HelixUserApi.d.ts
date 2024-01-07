import { type UserIdResolvable, type UserNameResolvable } from '@twurple/common';
import { type HelixUserBlockData } from '../../interfaces/endpoints/user.external';
import { type HelixUserBlockAdditionalInfo, type HelixUserUpdate } from '../../interfaces/endpoints/user.input';
import { type HelixUserExtensionUpdatePayload } from '../../interfaces/endpoints/userExtension.input';
import { HelixPaginatedRequest } from '../../utils/pagination/HelixPaginatedRequest';
import { type HelixPaginatedResult } from '../../utils/pagination/HelixPaginatedResult';
import { type HelixForwardPagination } from '../../utils/pagination/HelixPagination';
import { BaseApi } from '../BaseApi';
import { HelixInstalledExtensionList } from './extensions/HelixInstalledExtensionList';
import { HelixUserExtension } from './extensions/HelixUserExtension';
import { HelixPrivilegedUser } from './HelixPrivilegedUser';
import { HelixUser } from './HelixUser';
import { HelixUserBlock } from './HelixUserBlock';
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
export declare class HelixUserApi extends BaseApi {
    /**
     * Gets the user data for the given list of user IDs.
     *
     * @param userIds The user IDs you want to look up.
     */
    getUsersByIds(userIds: UserIdResolvable[]): Promise<HelixUser[]>;
    /**
     * Gets the user data for the given list of usernames.
     *
     * @param userNames The usernames you want to look up.
     */
    getUsersByNames(userNames: UserNameResolvable[]): Promise<HelixUser[]>;
    /**
     * Gets the user data for the given user ID.
     *
     * @param user The user ID you want to look up.
     */
    getUserById(user: UserIdResolvable): Promise<HelixUser | null>;
    /**
     * Gets the user data for the given user ID, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The user ID you want to look up.
     */
    getUserByIdBatched(user: UserIdResolvable): Promise<HelixUser | null>;
    /**
     * Gets the user data for the given username.
     *
     * @param userName The username you want to look up.
     */
    getUserByName(userName: UserNameResolvable): Promise<HelixUser | null>;
    /**
     * Gets the user data for the given username, batching multiple calls into fewer requests as the API allows.
     *
     * @param user The username you want to look up.
     */
    getUserByNameBatched(user: UserNameResolvable): Promise<HelixUser | null>;
    /**
     * Gets the user data of the given authenticated user.
     *
     * @param user The user to get data for.
     * @param withEmail Whether you need the user's email address.
     */
    getAuthenticatedUser(user: UserIdResolvable, withEmail?: boolean): Promise<HelixPrivilegedUser>;
    /**
     * Updates the given authenticated user's data.
     *
     * @param user The user to update.
     * @param data The data to update.
     */
    updateAuthenticatedUser(user: UserIdResolvable, data: HelixUserUpdate): Promise<HelixPrivilegedUser>;
    /**
     * Gets a list of users blocked by the given user.
     *
     * @param user The user to get blocks for.
     * @param pagination
     *
     * @expandParams
     */
    getBlocks(user: UserIdResolvable, pagination?: HelixForwardPagination): Promise<HelixPaginatedResult<HelixUserBlock>>;
    /**
     * Creates a paginator for users blocked by the given user.
     *
     * @param user The user to get blocks for.
     */
    getBlocksPaginated(user: UserIdResolvable): HelixPaginatedRequest<HelixUserBlockData, HelixUserBlock>;
    /**
     * Blocks the given user.
     *
     * @param broadcaster The user to add the block to.
     * @param target The user to block.
     * @param additionalInfo Additional info to give context to the block.
     *
     * @expandParams
     */
    createBlock(broadcaster: UserIdResolvable, target: UserIdResolvable, additionalInfo?: HelixUserBlockAdditionalInfo): Promise<void>;
    /**
     * Unblocks the given user.
     *
     * @param broadcaster The user to remove the block from.
     * @param target The user to unblock.
     */
    deleteBlock(broadcaster: UserIdResolvable, target: UserIdResolvable): Promise<void>;
    /**
     * Gets a list of all extensions for the given authenticated user.
     *
     * @param broadcaster The broadcaster to get the list of extensions for.
     * @param withInactive Whether to include inactive extensions.
     */
    getExtensionsForAuthenticatedUser(broadcaster: UserIdResolvable, withInactive?: boolean): Promise<HelixUserExtension[]>;
    /**
     * Gets a list of all installed extensions for the given user.
     *
     * @param user The user to get the installed extensions for.
     * @param withDev Whether to include extensions that are in development.
     */
    getActiveExtensions(user: UserIdResolvable, withDev?: boolean): Promise<HelixInstalledExtensionList>;
    /**
     * Updates the installed extensions for the given authenticated user.
     *
     * @param broadcaster The user to update the installed extensions for.
     * @param data The extension installation payload.
     *
     * The format is shown on the [Twitch documentation](https://dev.twitch.tv/docs/api/reference#update-user-extensions).
     * Don't use the "data" wrapper though.
     */
    updateActiveExtensionsForAuthenticatedUser(broadcaster: UserIdResolvable, data: HelixUserExtensionUpdatePayload): Promise<HelixInstalledExtensionList>;
    private _getUsers;
}
//# sourceMappingURL=HelixUserApi.d.ts.map