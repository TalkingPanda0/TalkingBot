"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixChannel = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
/**
 * A Twitch channel.
 */
let HelixChannel = class HelixChannel extends common_1.DataObject {
    /** @internal */
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The ID of the channel.
     */
    get id() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * The name of the channel.
     */
    get name() {
        return this[common_1.rawDataSymbol].broadcaster_login;
    }
    /**
     * The display name of the channel.
     */
    get displayName() {
        return this[common_1.rawDataSymbol].broadcaster_name;
    }
    /**
     * Gets more information about the broadcaster of the channel.
     */
    async getBroadcaster() {
        return (0, common_1.checkRelationAssertion)(await this._client.users.getUserById(this[common_1.rawDataSymbol].broadcaster_id));
    }
    /**
     * The language of the channel.
     */
    get language() {
        return this[common_1.rawDataSymbol].broadcaster_language;
    }
    /**
     * The ID of the game currently played on the channel.
     */
    get gameId() {
        return this[common_1.rawDataSymbol].game_id;
    }
    /**
     * The name of the game currently played on the channel.
     */
    get gameName() {
        return this[common_1.rawDataSymbol].game_name;
    }
    /**
     * Gets information about the game that is being played on the stream.
     */
    async getGame() {
        return this[common_1.rawDataSymbol].game_id
            ? (0, common_1.checkRelationAssertion)(await this._client.games.getGameById(this[common_1.rawDataSymbol].game_id))
            : null;
    }
    /**
     * The title of the channel.
     */
    get title() {
        return this[common_1.rawDataSymbol].title;
    }
    /**
     * The stream delay of the channel, in seconds.
     *
     * If you didn't request this with broadcaster access, this is always zero.
     */
    get delay() {
        return this[common_1.rawDataSymbol].delay;
    }
    /**
     * The tags applied to the channel.
     */
    get tags() {
        return this[common_1.rawDataSymbol].tags;
    }
    /**
     * The content classification labels applied to the channel.
     */
    get contentClassificationLabels() {
        return this[common_1.rawDataSymbol].content_classification_labels;
    }
    /**
     * Whether the channel currently displays branded content (as specified by the broadcaster).
     */
    get isBrandedContent() {
        return this[common_1.rawDataSymbol].is_branded_content;
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixChannel.prototype, "_client", void 0);
HelixChannel = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixChannel', 'id')
], HelixChannel);
exports.HelixChannel = HelixChannel;
