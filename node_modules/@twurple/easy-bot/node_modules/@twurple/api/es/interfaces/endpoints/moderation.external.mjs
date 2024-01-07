import { extractUserId } from '@twurple/common';
/** @internal */
export function createModerationUserListQuery(channel, filter) {
    return {
        broadcaster_id: extractUserId(channel),
        user_id: filter === null || filter === void 0 ? void 0 : filter.userId,
    };
}
/** @internal */
export function createModeratorModifyQuery(broadcaster, user) {
    return {
        broadcaster_id: extractUserId(broadcaster),
        user_id: extractUserId(user),
    };
}
/** @internal */
export function createAutoModProcessBody(user, msgId, allow) {
    return {
        user_id: extractUserId(user),
        msg_id: msgId,
        action: allow ? 'ALLOW' : 'DENY',
    };
}
/** @internal */
export function createAutoModSettingsBody(data) {
    return {
        overall_level: data.overallLevel,
        aggression: data.aggression,
        bullying: data.bullying,
        disability: data.disability,
        misogyny: data.misogyny,
        race_ethnicity_or_religion: data.raceEthnicityOrReligion,
        sex_based_terms: data.sexBasedTerms,
        sexuality_sex_or_gender: data.sexualitySexOrGender,
        swearing: data.swearing,
    };
}
/** @internal */
export function createBanUserBody(data) {
    return {
        data: {
            duration: data.duration,
            reason: data.reason,
            user_id: extractUserId(data.user),
        },
    };
}
/** @internal */
export function createUpdateShieldModeStatusBody(activate) {
    return {
        is_active: activate,
    };
}
