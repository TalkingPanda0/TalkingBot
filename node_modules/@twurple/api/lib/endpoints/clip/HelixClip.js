"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixClip = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * A clip from a Twitch stream.
 */
let HelixClip = class HelixClip extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The clip ID.
     */
    get id() {
        return this[common_1.rawDataSymbol].id;
    }
    /**
     * The URL of the clip.
     */
    get url() {
        return this[common_1.rawDataSymbol].url;
    }
    /**
     * The embed URL of the clip.
     */
    get embedUrl() {
        return this[common_1.rawDataSymbol].embed_url;
    }
    /**
     * The user ID of the broadcaster of the stream where the clip was created.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * The display name of the broadcaster of the stream where the clip was created.
     */
    get broadcasterDisplayName() {
        return this[common_1.rawDataSymbol].broadcaster_name;
    }
    /**
     * Gets information about the broadcaster of the stream where the clip was created.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_id));
    }
    /**
     * The user ID of the creator of the clip.
     */
    get creatorId() {
        return this[common_1.rawDataSymbol].creator_id;
    }
    /**
     * The display name of the creator of the clip.
     */
    get creatorDisplayName() {
        return this[common_1.rawDataSymbol].creator_name;
    }
    /**
     * Gets information about the creator of the clip.
     */
    async getCreator() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].creator_id));
    }
    /**
     * The ID of the video the clip is taken from.
     */
    get videoId() {
        return this[common_1.rawDataSymbol].video_id;
    }
    /**
     * Gets information about the video the clip is taken from.
     */
    async getVideo() {
        return (0, common_1.checkRelationAssertion)(await this._client.videos.getVideoById(this[common_1.rawDataSymbol].video_id));
    }
    /**
     * The ID of the game that was being played when the clip was created.
     */
    get gameId() {
        return this[common_1.rawDataSymbol].game_id;
    }
    /**
     * Gets information about the game that was being played when the clip was created.
     */
    async getGame() {
        return this[common_1.rawDataSymbol].game_id
            ? (0, common_1.checkRelationAssertion)(await this._client.games.getGameById(this[common_1.rawDataSymbol].game_id))
            : null;
    }
    /**
     * The language of the stream where the clip was created.
     */
    get language() {
        return this[common_1.rawDataSymbol].language;
    }
    /**
     * The title of the clip.
     */
    get title() {
        return this[common_1.rawDataSymbol].title;
    }
    /**
     * The number of views of the clip.
     */
    get views() {
        return this[common_1.rawDataSymbol].view_count;
    }
    /**
     * The date when the clip was created.
     */
    get creationDate() {
        return new Date(this[common_1.rawDataSymbol].created_at);
    }
    /**
     * The URL of the thumbnail of the clip.
     */
    get thumbnailUrl() {
        return this[common_1.rawDataSymbol].thumbnail_url;
    }
    /**
     * The duration of the clip in seconds (up to 0.1 precision).
     */
    get duration() {
        return this[common_1.rawDataSymbol].duration;
    }
    /**
     * The offset of the clip from the start of the corresponding VOD, in seconds.
     *
     * This may be null if there is no VOD or if the clip is created from a live broadcast,
     * in which case it may take a few minutes to associate with the VOD.
     */
    get vodOffset() {
        return this[common_1.rawDataSymbol].vod_offset;
    }
    /**
     * Whether the clip is featured.
     */
    get isFeatured() {
        return this[common_1.rawDataSymbol].is_featured;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixClip.prototype, "_client", void 0);
HelixClip = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixClip', 'id')
], HelixClip);
exports.HelixClip = HelixClip;
