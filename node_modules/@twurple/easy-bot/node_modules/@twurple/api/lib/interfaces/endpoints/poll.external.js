"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPollEndBody = exports.createPollBody = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createPollBody(broadcaster, data) {
    var _a;
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        title: data.title,
        choices: data.choices.map(title => ({ title })),
        duration: data.duration,
        channel_points_voting_enabled: data.channelPointsPerVote != null,
        channel_points_per_vote: (_a = data.channelPointsPerVote) !== null && _a !== void 0 ? _a : 0,
    };
}
exports.createPollBody = createPollBody;
/** @internal */
function createPollEndBody(broadcaster, id, showResult) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        id,
        status: showResult ? 'TERMINATED' : 'ARCHIVED',
    };
}
exports.createPollEndBody = createPollEndBody;
