import { CustomError } from '@twurple/common';
/**
 * Thrown when an intent is requested that was not recognized by the {@link AuthProvider}.
 */
export class UnknownIntentError extends CustomError {
    /** @private */
    constructor(intent) {
        super(`Unknown intent: ${intent}`);
        this.intent = intent;
    }
}
