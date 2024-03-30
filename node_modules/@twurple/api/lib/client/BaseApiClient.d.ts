import { type Response } from '@d-fischer/cross-fetch';
import type { Logger } from '@d-fischer/logger';
import { type RateLimiter, type RateLimiterStats } from '@d-fischer/rate-limiter';
import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { type AuthProvider, TokenInfo } from '@twurple/auth';
import { type UserIdResolvable } from '@twurple/common';
import { HelixBitsApi } from '../endpoints/bits/HelixBitsApi';
import { HelixChannelApi } from '../endpoints/channel/HelixChannelApi';
import { HelixChannelPointsApi } from '../endpoints/channelPoints/HelixChannelPointsApi';
import { HelixCharityApi } from '../endpoints/charity/HelixCharityApi';
import { HelixChatApi } from '../endpoints/chat/HelixChatApi';
import { HelixClipApi } from '../endpoints/clip/HelixClipApi';
import { HelixContentClassificationLabelApi } from '../endpoints/contentClassificationLabels/HelixContentClassificationLabelApi';
import { HelixEntitlementApi } from '../endpoints/entitlements/HelixEntitlementApi';
import { HelixEventSubApi } from '../endpoints/eventSub/HelixEventSubApi';
import { HelixExtensionsApi } from '../endpoints/extensions/HelixExtensionsApi';
import { HelixGameApi } from '../endpoints/game/HelixGameApi';
import { HelixGoalApi } from '../endpoints/goals/HelixGoalApi';
import { HelixHypeTrainApi } from '../endpoints/hypeTrain/HelixHypeTrainApi';
import { HelixModerationApi } from '../endpoints/moderation/HelixModerationApi';
import { HelixPollApi } from '../endpoints/poll/HelixPollApi';
import { HelixPredictionApi } from '../endpoints/prediction/HelixPredictionApi';
import { HelixRaidApi } from '../endpoints/raids/HelixRaidApi';
import { HelixScheduleApi } from '../endpoints/schedule/HelixScheduleApi';
import { HelixSearchApi } from '../endpoints/search/HelixSearchApi';
import { HelixStreamApi } from '../endpoints/stream/HelixStreamApi';
import { HelixSubscriptionApi } from '../endpoints/subscriptions/HelixSubscriptionApi';
import { HelixTeamApi } from '../endpoints/team/HelixTeamApi';
import { HelixUserApi } from '../endpoints/user/HelixUserApi';
import { HelixVideoApi } from '../endpoints/video/HelixVideoApi';
import { HelixWhisperApi } from '../endpoints/whisper/HelixWhisperApi';
import { ApiReportedRequest } from '../reporting/ApiReportedRequest';
import { type ApiConfig, type TwitchApiCallOptionsInternal } from './ApiClient';
import { type ContextApiCallOptions } from './ContextApiCallOptions';
/** @private */
export declare class BaseApiClient extends EventEmitter {
    protected readonly _config: ApiConfig;
    protected readonly _logger: Logger;
    protected readonly _rateLimiter: RateLimiter<TwitchApiCallOptionsInternal, Response>;
    readonly onRequest: import("@d-fischer/typed-event-emitter").EventBinder<[request: ApiReportedRequest]>;
    /**
     * Requests scopes from the auth provider for the given user.
     *
     * @param user The user to request scopes for.
     * @param scopes The scopes to request.
     */
    requestScopesForUser(user: UserIdResolvable, scopes: string[]): Promise<void>;
    /**
     * Gets information about your access token.
     */
    getTokenInfo(): Promise<TokenInfo>;
    /**
     * Makes a call to the Twitch API using your access token.
     *
     * @param options The configuration of the call.
     */
    callApi<T = unknown>(options: ContextApiCallOptions): Promise<T>;
    /**
     * The Helix bits API methods.
     */
    get bits(): HelixBitsApi;
    /**
     * The Helix channels API methods.
     */
    get channels(): HelixChannelApi;
    /**
     * The Helix channel points API methods.
     */
    get channelPoints(): HelixChannelPointsApi;
    /**
     * The Helix charity API methods.
     */
    get charity(): HelixCharityApi;
    /**
     * The Helix chat API methods.
     */
    get chat(): HelixChatApi;
    /**
     * The Helix clips API methods.
     */
    get clips(): HelixClipApi;
    /**
     * The Helix content classification label API methods.
     */
    get contentClassificationLabels(): HelixContentClassificationLabelApi;
    /**
     * The Helix entitlement API methods.
     */
    get entitlements(): HelixEntitlementApi;
    /**
     * The Helix EventSub API methods.
     */
    get eventSub(): HelixEventSubApi;
    /**
     * The Helix extensions API methods.
     */
    get extensions(): HelixExtensionsApi;
    /**
     * The Helix game API methods.
     */
    get games(): HelixGameApi;
    /**
     * The Helix Hype Train API methods.
     */
    get hypeTrain(): HelixHypeTrainApi;
    /**
     * The Helix goal API methods.
     */
    get goals(): HelixGoalApi;
    /**
     * The Helix moderation API methods.
     */
    get moderation(): HelixModerationApi;
    /**
     * The Helix poll API methods.
     */
    get polls(): HelixPollApi;
    /**
     * The Helix prediction API methods.
     */
    get predictions(): HelixPredictionApi;
    /**
     * The Helix raid API methods.
     */
    get raids(): HelixRaidApi;
    /**
     * The Helix schedule API methods.
     */
    get schedule(): HelixScheduleApi;
    /**
     * The Helix search API methods.
     */
    get search(): HelixSearchApi;
    /**
     * The Helix stream API methods.
     */
    get streams(): HelixStreamApi;
    /**
     * The Helix subscription API methods.
     */
    get subscriptions(): HelixSubscriptionApi;
    /**
     * The Helix team API methods.
     */
    get teams(): HelixTeamApi;
    /**
     * The Helix user API methods.
     */
    get users(): HelixUserApi;
    /**
     * The Helix video API methods.
     */
    get videos(): HelixVideoApi;
    /**
     * The API methods that deal with whispers.
     */
    get whispers(): HelixWhisperApi;
    /**
     * Statistics on the rate limiter for the Helix API.
     */
    get rateLimiterStats(): RateLimiterStats | null;
    /** @private */
    get _authProvider(): AuthProvider;
    /** @private */
    get _mockServerPort(): number | undefined;
    private _callApiUsingInitialToken;
    private _callApiInternal;
}
//# sourceMappingURL=BaseApiClient.d.ts.map