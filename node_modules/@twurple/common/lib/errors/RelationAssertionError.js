"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationAssertionError = void 0;
const CustomError_1 = require("./CustomError");
/**
 * Thrown when a relation that is expected to never be null does return null.
 */
class RelationAssertionError extends CustomError_1.CustomError {
    constructor() {
        super('Relation returned null - this may be a library bug or a race condition in your own code');
    }
}
exports.RelationAssertionError = RelationAssertionError;
