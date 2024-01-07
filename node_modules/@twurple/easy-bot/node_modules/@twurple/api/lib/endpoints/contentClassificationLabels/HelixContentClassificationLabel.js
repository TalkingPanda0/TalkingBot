"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixContentClassificationLabel = void 0;
const common_1 = require("@twurple/common");
/**
 * A content classification label that can be applied to a Twitch stream.
 */
class HelixContentClassificationLabel extends common_1.DataObject {
    /**
     * The ID of the content classification label.
     */
    get id() {
        return this[common_1.rawDataSymbol].id;
    }
    /**
     * The name of the content classification label.
     */
    get name() {
        return this[common_1.rawDataSymbol].name;
    }
    /**
     * The description of the content classification label.
     */
    get description() {
        return this[common_1.rawDataSymbol].description;
    }
}
exports.HelixContentClassificationLabel = HelixContentClassificationLabel;
