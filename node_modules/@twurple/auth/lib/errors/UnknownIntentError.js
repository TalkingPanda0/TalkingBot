"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownIntentError = void 0;
const common_1 = require("@twurple/common");
/**
 * Thrown when an intent is requested that was not recognized by the {@link AuthProvider}.
 */
class UnknownIntentError extends common_1.CustomError {
    /** @private */
    constructor(intent) {
        super(`Unknown intent: ${intent}`);
        this.intent = intent;
    }
}
exports.UnknownIntentError = UnknownIntentError;
