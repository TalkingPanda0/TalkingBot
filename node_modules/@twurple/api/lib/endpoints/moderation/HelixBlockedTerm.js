"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixBlockedTerm = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * Information about a word or phrase blocked in a broadcaster's channel.
 */
let HelixBlockedTerm = class HelixBlockedTerm extends common_1.DataObject {
    /**
     * The ID of the broadcaster that owns the list of blocked terms.
     */
    get broadcasterId() {
        return this[common_1.rawDataSymbol].broadcaster_id;
    }
    /**
     * The date and time of when the term was blocked.
     */
    get creationDate() {
        return new Date(this[common_1.rawDataSymbol].created_at);
    }
    /**
     * The date and time of when the blocked term is set to expire. After the block expires, users will be able to use the term in the broadcaster’s chat room.
     * Is `null` if the term was added manually or permanently blocked by AutoMod.
     */
    get expirationDate() {
        return this[common_1.rawDataSymbol].expires_at ? new Date(this[common_1.rawDataSymbol].expires_at) : null;
    }
    /**
     * An ID that uniquely identifies this blocked term.
     */
    get id() {
        return this[common_1.rawDataSymbol].id;
    }
    /**
     * The ID of the moderator that blocked the word or phrase from being used in the broadcaster’s chat room.
     */
    get moderatorId() {
        return this[common_1.rawDataSymbol].moderator_id;
    }
    /**
     * The blocked word or phrase.
     */
    get text() {
        return this[common_1.rawDataSymbol].text;
    }
    /**
     * The date and time of when the term was updated.
     */
    get updatedDate() {
        return new Date(this[common_1.rawDataSymbol].updated_at);
    }
};
HelixBlockedTerm = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixBlockedTerm', 'id')
], HelixBlockedTerm);
exports.HelixBlockedTerm = HelixBlockedTerm;
