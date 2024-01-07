"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixChannelEmote = void 0;
const tslib_1 = require("tslib");
const shared_utils_1 = require("@d-fischer/shared-utils");
const common_1 = require("@twurple/common");
const HelixEmote_1 = require("./HelixEmote");
/**
 * A Twitch Channel emote.
 *
 * @inheritDoc
 */
let HelixChannelEmote = class HelixChannelEmote extends HelixEmote_1.HelixEmote {
    constructor(data, client) {
        super(data);
        this._client = client;
    }
    /**
     * The subscription tier necessary to unlock the emote, or null if the emote is not a subscription emote.
     */
    get tier() {
        return this[common_1.rawDataSymbol].tier || null;
    }
    /**
     * The type of the emote.
     *
     * There are many types of emotes that Twitch seems to arbitrarily assign. Do not rely on this value.
     */
    get type() {
        return this[common_1.rawDataSymbol].emote_type;
    }
    /**
     * The ID of the emote set the emote is part of.
     */
    get emoteSetId() {
        return this[common_1.rawDataSymbol].emote_set_id;
    }
    /**
     * Gets all emotes from the emote's set.
     */
    async getAllEmotesFromSet() {
        return await this._client.chat.getEmotesFromSets([this[common_1.rawDataSymbol].emote_set_id]);
    }
};
tslib_1.__decorate([
    (0, shared_utils_1.Enumerable)(false)
], HelixChannelEmote.prototype, "_client", void 0);
HelixChannelEmote = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixChannelEmote', 'id')
], HelixChannelEmote);
exports.HelixChannelEmote = HelixChannelEmote;
