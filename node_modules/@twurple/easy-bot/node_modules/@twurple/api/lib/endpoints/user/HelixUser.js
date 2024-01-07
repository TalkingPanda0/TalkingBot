"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixUser = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * A Twitch user.
 */
let HelixUser = class HelixUser extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the user.
     */
    get id() {
        return this[common_1.rawDataSymbol].id;
    }
    /**
     * The name of the user.
     */
    get name() {
        return this[common_1.rawDataSymbol].login;
    }
    /**
     * The display name of the user.
     */
    get displayName() {
        return this[common_1.rawDataSymbol].display_name;
    }
    /**
     * The description of the user.
     */
    get description() {
        return this[common_1.rawDataSymbol].description;
    }
    /**
     * The type of the user.
     */
    get type() {
        return this[common_1.rawDataSymbol].type;
    }
    /**
     * The type of the broadcaster.
     */
    get broadcasterType() {
        return this[common_1.rawDataSymbol].broadcaster_type;
    }
    /**
     * The URL of the profile picture of the user.
     */
    get profilePictureUrl() {
        return this[common_1.rawDataSymbol].profile_image_url;
    }
    /**
     * The URL of the offline video placeholder of the user.
     */
    get offlinePlaceholderUrl() {
        return this[common_1.rawDataSymbol].offline_image_url;
    }
    /**
     * The date when the user was created, i.e. when they registered on Twitch.
     */
    get creationDate() {
        return new Date(this[common_1.rawDataSymbol].created_at);
    }
    /**
     * Gets the channel's stream data.
     */
    async getStream() {
        return await this._client.streams.getStreamByUserId(this);
    }
    /**
     * Gets a list of broadcasters the user follows.
     */
    async getFollowedChannels() {
        return await this._client.channels.getFollowedChannels(this);
    }
    /**
     * Gets the follow data of the user to the given broadcaster, or `null` if the user doesn't follow the broadcaster.
     *
     * This requires user authentication.
     * For broadcaster authentication, you can use `getChannelFollower` while switching `this` and the parameter.
     *
     * @param broadcaster The broadcaster to check the follow to.
     */
    async getFollowedChannel(broadcaster) {
        var _a;
        const result = await this._client.channels.getFollowedChannels(this, broadcaster);
        return (_a = result.data[0]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Checks whether the user is following the given broadcaster.
     *
     * This requires user authentication.
     * For broadcaster authentication, you can use `isFollowedBy` while switching `this` and the parameter.
     *
     * @param broadcaster The broadcaster to check the user's follow to.
     */
    async follows(broadcaster) {
        return (await this.getFollowedChannel(broadcaster)) !== null;
    }
    /**
     * Gets a list of users that follow the broadcaster.
     */
    async getChannelFollowers() {
        return await this._client.channels.getChannelFollowers(this);
    }
    /**
     * Gets the follow data of the given user to the broadcaster, or `null` if the user doesn't follow the broadcaster.
     *
     * This requires broadcaster authentication.
     * For user authentication, you can use `getFollowedChannel` while switching `this` and the parameter.
     *
     * @param user The user to check the follow from.
     */
    async getChannelFollower(user) {
        var _a;
        const result = await this._client.channels.getChannelFollowers(this, user);
        return (_a = result.data[0]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Checks whether the given user is following the broadcaster.
     *
     * This requires broadcaster authentication.
     * For user authentication, you can use `follows` while switching `this` and the parameter.
     *
     * @param user The user to check the broadcaster's follow from.
     */
    async isFollowedBy(user) {
        return (await this.getChannelFollower(user)) !== null;
    }
    /**
     * Gets the subscription data for the user to the given broadcaster, or `null` if the user is not subscribed.
     *
     * This requires user authentication.
     * For broadcaster authentication, you can use `getSubscriber` while switching `this` and the parameter.
     *
     * @param broadcaster The broadcaster you want to get the subscription data for.
     */
    async getSubscriptionTo(broadcaster) {
        return await this._client.subscriptions.checkUserSubscription(this, broadcaster);
    }
    /**
     * Checks whether the user is subscribed to the given broadcaster.
     *
     * This requires user authentication.
     * For broadcaster authentication, you can use `hasSubscriber` while switching `this` and the parameter.
     *
     * @param broadcaster The broadcaster you want to check the subscription for.
     */
    async isSubscribedTo(broadcaster) {
        return (await this.getSubscriptionTo(broadcaster)) !== null;
    }
    /**
     * Gets the subscription data for the given user to the broadcaster, or `null` if the user is not subscribed.
     *
     * This requires broadcaster authentication.
     * For user authentication, you can use `getSubscriptionTo` while switching `this` and the parameter.
     *
     * @param user The user you want to get the subscription data for.
     */
    async getSubscriber(user) {
        return await this._client.subscriptions.getSubscriptionForUser(this, user);
    }
    /**
     * Checks whether the given user is subscribed to the broadcaster.
     *
     * This requires broadcaster authentication.
     * For user authentication, you can use `isSubscribedTo` while switching `this` and the parameter.
     *
     * @param user The user you want to check the subscription for.
     */
    async hasSubscriber(user) {
        return (await this.getSubscriber(user)) !== null;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixUser.prototype, "_client", void 0);
HelixUser = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixUser', 'id')
], HelixUser);
exports.HelixUser = HelixUser;
