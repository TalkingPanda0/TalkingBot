"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixAutoModStatus = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
/**
 * The status of a message that says whether it is permitted by AutoMod or not.
 */
let HelixAutoModStatus = class HelixAutoModStatus extends common_1.DataObject {
    /**
     * The developer-generated ID that was sent with the request data.
     */
    get messageId() {
        return this[common_1.rawDataSymbol].msg_id;
    }
    /**
     * Whether the message is permitted by AutoMod or not.
     */
    get isPermitted() {
        return this[common_1.rawDataSymbol].is_permitted;
    }
};
HelixAutoModStatus = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixAutoModStatus', 'messageId')
], HelixAutoModStatus);
exports.HelixAutoModStatus = HelixAutoModStatus;
