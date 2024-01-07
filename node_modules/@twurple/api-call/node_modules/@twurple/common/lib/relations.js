"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRelationAssertion = void 0;
const RelationAssertionError_1 = require("./errors/RelationAssertionError");
/** @private */
function checkRelationAssertion(value) {
    if (value == null) {
        throw new RelationAssertionError_1.RelationAssertionError();
    }
    return value;
}
exports.checkRelationAssertion = checkRelationAssertion;
