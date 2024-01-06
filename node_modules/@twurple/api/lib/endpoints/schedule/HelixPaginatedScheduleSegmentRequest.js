"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixPaginatedScheduleSegmentRequest = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@twurple/common");
const schedule_external_1 = require("../../interfaces/endpoints/schedule.external");
const HelixPaginatedRequest_1 = require("../../utils/pagination/HelixPaginatedRequest");
const HelixScheduleSegment_1 = require("./HelixScheduleSegment");
/**
 * A paginator specifically for schedule segments.
 */
let HelixPaginatedScheduleSegmentRequest = class HelixPaginatedScheduleSegmentRequest extends HelixPaginatedRequest_1.HelixPaginatedRequest {
    /** @internal */
    constructor(broadcaster, client, filter) {
        super({
            url: 'schedule',
            query: (0, schedule_external_1.createScheduleQuery)(broadcaster, filter),
        }, client, data => new HelixScheduleSegment_1.HelixScheduleSegment(data, client), 25);
    }
    // sadly, this hack is necessary to work around the weird data model of schedules
    // while still keeping the pagination code as generic as possible
    /** @internal */
    async _fetchData(additionalOptions = {}) {
        var _a;
        const origData = (await super._fetchData(additionalOptions));
        return {
            data: (_a = origData.data.segments) !== null && _a !== void 0 ? _a : [],
            pagination: origData.pagination,
        };
    }
};
HelixPaginatedScheduleSegmentRequest = tslib_1.__decorate([
    (0, common_1.rtfm)('api', 'HelixPaginatedScheduleSegmentRequest')
], HelixPaginatedScheduleSegmentRequest);
exports.HelixPaginatedScheduleSegmentRequest = HelixPaginatedScheduleSegmentRequest;
