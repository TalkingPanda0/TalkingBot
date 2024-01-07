import { RelationAssertionError } from "./errors/RelationAssertionError.mjs";
/** @private */
export function checkRelationAssertion(value) {
    if (value == null) {
        throw new RelationAssertionError();
    }
    return value;
}
