import { type AccessToken } from '../AccessToken';
import { type AuthProvider } from './AuthProvider';
/**
 * An auth provider that gets tokens using client credentials.
 */
export declare class AppTokenAuthProvider implements AuthProvider {
    private readonly _clientId;
    private readonly _impliedScopes;
    /**
     * Creates a new auth provider to receive an application token with using the client ID and secret.
     *
     * @param clientId The client ID of your application.
     * @param clientSecret The client secret of your application.
     * @param impliedScopes The scopes that are implied for your application,
     * for example an extension that is allowed to access subscriptions.
     */
    constructor(clientId: string, clientSecret: string, impliedScopes?: string[]);
    /**
     * The client ID.
     */
    get clientId(): string;
    /**
     * The scopes that are currently available using the access token.
     */
    get currentScopes(): string[];
    /**
     * Throws, because this auth provider does not support user authentication.
     */
    getAccessTokenForUser(): Promise<never>;
    /**
     * Throws, because this auth provider does not support user authentication.
     */
    getCurrentScopesForUser(): never;
    /**
     * Fetches an app access token.
     */
    getAnyAccessToken(): Promise<AccessToken>;
    /**
     * Fetches an app access token.
     *
     * @param forceNew Whether to always get a new token, even if the old one is still deemed valid internally.
     */
    getAppAccessToken(forceNew?: boolean): Promise<AccessToken>;
    private _fetch;
}
//# sourceMappingURL=AppTokenAuthProvider.d.ts.map