import { extractUserId } from '@twurple/common';
/** @internal */
export function createPollBody(broadcaster, data) {
    var _a;
    return {
        broadcaster_id: extractUserId(broadcaster),
        title: data.title,
        choices: data.choices.map(title => ({ title })),
        duration: data.duration,
        channel_points_voting_enabled: data.channelPointsPerVote != null,
        channel_points_per_vote: (_a = data.channelPointsPerVote) !== null && _a !== void 0 ? _a : 0,
    };
}
/** @internal */
export function createPollEndBody(broadcaster, id, showResult) {
    return {
        broadcaster_id: extractUserId(broadcaster),
        id,
        status: showResult ? 'TERMINATED' : 'ARCHIVED',
    };
}
