"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScheduleSegmentUpdateBody = exports.createScheduleSegmentModifyQuery = exports.createScheduleSegmentBody = exports.createScheduleSettingsUpdateQuery = exports.createScheduleQuery = void 0;
const common_1 = require("@twurple/common");
/** @internal */
function createScheduleQuery(broadcaster, filter) {
    var _a;
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        start_time: filter === null || filter === void 0 ? void 0 : filter.startDate,
        utc_offset: (_a = filter === null || filter === void 0 ? void 0 : filter.utcOffset) === null || _a === void 0 ? void 0 : _a.toString(),
    };
}
exports.createScheduleQuery = createScheduleQuery;
/** @internal */
function createScheduleSettingsUpdateQuery(broadcaster, settings) {
    if (settings.vacation) {
        return {
            broadcaster_id: (0, common_1.extractUserId)(broadcaster),
            is_vacation_enabled: 'true',
            vacation_start_time: settings.vacation.startDate,
            vacation_end_time: settings.vacation.endDate,
            timezone: settings.vacation.timezone,
        };
    }
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        is_vacation_enabled: 'false',
    };
}
exports.createScheduleSettingsUpdateQuery = createScheduleSettingsUpdateQuery;
/** @internal */
function createScheduleSegmentBody(data) {
    return {
        start_time: data.startDate,
        timezone: data.timezone,
        is_recurring: data.isRecurring,
        duration: data.duration,
        category_id: data.categoryId,
        title: data.title,
    };
}
exports.createScheduleSegmentBody = createScheduleSegmentBody;
/** @internal */
function createScheduleSegmentModifyQuery(broadcaster, segmentId) {
    return {
        broadcaster_id: (0, common_1.extractUserId)(broadcaster),
        id: segmentId,
    };
}
exports.createScheduleSegmentModifyQuery = createScheduleSegmentModifyQuery;
/** @internal */
function createScheduleSegmentUpdateBody(data) {
    return {
        start_time: data.startDate,
        timezone: data.timezone,
        is_canceled: data.isCanceled,
        duration: data.duration,
        category_id: data.categoryId,
        title: data.title,
    };
}
exports.createScheduleSegmentUpdateBody = createScheduleSegmentUpdateBody;
