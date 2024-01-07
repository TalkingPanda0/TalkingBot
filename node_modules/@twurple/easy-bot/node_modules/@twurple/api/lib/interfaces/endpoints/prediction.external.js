"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEndPredictionBody = exports.createPredictionBody = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createPredictionBody(broadcaster, data) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        title: data.title,
        outcomes: data.outcomes.map(title => ({ title })),
        prediction_window: data.autoLockAfter,
    };
}
exports.createPredictionBody = createPredictionBody;
/** @internal */
function createEndPredictionBody(broadcaster, id, status, outcomeId) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        id,
        status,
        winning_outcome_id: outcomeId,
    };
}
exports.createEndPredictionBody = createEndPredictionBody;
