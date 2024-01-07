"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixRaid = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * A result of a successful raid initiation.
 */
let HelixRaid = class HelixRaid extends common_1.DataObject {
    /**
     * The date when the raid was initiated.
     */
    get creationDate() {
        return new Date(this[common_1.rawDataSymbol].created_at);
    }
    /**
     * Whether the raid target channel is intended for mature audiences.
     */
    get targetIsMature() {
        return this[common_1.rawDataSymbol].is_mature;
    }
};
HelixRaid = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixRaid')
], HelixRaid);
exports.HelixRaid = HelixRaid;
