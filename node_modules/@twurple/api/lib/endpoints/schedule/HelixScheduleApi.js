"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelixScheduleApi = void 0;
const api_call_1 = require("@twurple/api-call");
const common_1 = require("@twurple/common");
const generic_external_1 = require("../../interfaces/endpoints/generic.external");
const schedule_external_1 = require("../../interfaces/endpoints/schedule.external");
const HelixPagination_1 = require("../../utils/pagination/HelixPagination");
const BaseApi_1 = require("../BaseApi");
const HelixPaginatedScheduleSegmentRequest_1 = require("./HelixPaginatedScheduleSegmentRequest");
const HelixSchedule_1 = require("./HelixSchedule");
const HelixScheduleSegment_1 = require("./HelixScheduleSegment");
/**
 * The Helix API methods that deal with schedules.
 *
 * Can be accessed using `client.schedule` on an {@link ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient({ authProvider });
 * const { data: schedule } = await api.helix.schedule.getSchedule('61369223');
 * ```
 *
 * @meta category helix
 * @meta categorizedTitle Schedule
 */
class HelixScheduleApi extends BaseApi_1.BaseApi {
    /**
     * Gets the schedule for a given broadcaster.
     *
     * @param broadcaster The broadcaster to get the schedule of.
     * @param filter
     *
     * @expandParams
     */
    async getSchedule(broadcaster, filter) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'schedule',
            userId: (0, common_1.extractUserId)(broadcaster),
            query: {
                ...(0, schedule_external_1.createScheduleQuery)(broadcaster, filter),
                ...(0, HelixPagination_1.createPaginationQuery)(filter),
            },
        });
        return {
            data: new HelixSchedule_1.HelixSchedule(result.data, this._client),
            cursor: result.pagination.cursor,
        };
    }
    /**
     * Creates a paginator for schedule segments for a given broadcaster.
     *
     * @param broadcaster The broadcaster to get the schedule segments of.
     * @param filter
     *
     * @expandParams
     */
    getScheduleSegmentsPaginated(broadcaster, filter) {
        return new HelixPaginatedScheduleSegmentRequest_1.HelixPaginatedScheduleSegmentRequest(broadcaster, this._client, filter);
    }
    /**
     * Gets a set of schedule segments by IDs.
     *
     * @param broadcaster The broadcaster to get schedule segments of.
     * @param ids The IDs of the schedule segments.
     */
    async getScheduleSegmentsByIds(broadcaster, ids) {
        var _a, _b;
        const result = await this._client.callApi({
            type: 'helix',
            url: 'schedule',
            userId: (0, common_1.extractUserId)(broadcaster),
            query: (0, generic_external_1.createGetByIdsQuery)(broadcaster, ids),
        });
        return (_b = (_a = result.data.segments) === null || _a === void 0 ? void 0 : _a.map(data => new HelixScheduleSegment_1.HelixScheduleSegment(data, this._client))) !== null && _b !== void 0 ? _b : [];
    }
    /**
     * Gets a single schedule segment by ID.
     *
     * @param broadcaster The broadcaster to get a schedule segment of.
     * @param id The ID of the schedule segment.
     */
    async getScheduleSegmentById(broadcaster, id) {
        const segments = await this.getScheduleSegmentsByIds(broadcaster, [id]);
        return segments.length ? segments[0] : null;
    }
    /**
     * Gets the schedule for a given broadcaster in iCal format.
     *
     * @param broadcaster The broadcaster to get the schedule for.
     */
    async getScheduleAsIcal(broadcaster) {
        return await this._client.callApi({
            type: 'helix',
            url: 'schedule/icalendar',
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
        });
    }
    /**
     * Updates the schedule settings of a given broadcaster.
     *
     * @param broadcaster The broadcaster to update the schedule settings for.
     * @param settings
     *
     * @expandParams
     */
    async updateScheduleSettings(broadcaster, settings) {
        await this._client.callApi({
            type: 'helix',
            url: 'schedule/settings',
            method: 'PATCH',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:schedule'],
            query: (0, schedule_external_1.createScheduleSettingsUpdateQuery)(broadcaster, settings),
        });
    }
    /**
     * Creates a new segment in a given broadcaster's schedule.
     *
     * @param broadcaster The broadcaster to create a new schedule segment for.
     * @param data
     *
     * @expandParams
     */
    async createScheduleSegment(broadcaster, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'schedule/segment',
            method: 'POST',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:schedule'],
            query: (0, api_call_1.createBroadcasterQuery)(broadcaster),
            jsonBody: (0, schedule_external_1.createScheduleSegmentBody)(data),
        });
        return new HelixScheduleSegment_1.HelixScheduleSegment(result.data.segments[0], this._client);
    }
    /**
     * Updates a segment in a given broadcaster's schedule.
     *
     * @param broadcaster The broadcaster to create a new schedule segment for.
     * @param segmentId The ID of the segment to update.
     * @param data
     *
     * @expandParams
     */
    async updateScheduleSegment(broadcaster, segmentId, data) {
        const result = await this._client.callApi({
            type: 'helix',
            url: 'schedule/segment',
            method: 'PATCH',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:schedule'],
            query: (0, schedule_external_1.createScheduleSegmentModifyQuery)(broadcaster, segmentId),
            jsonBody: (0, schedule_external_1.createScheduleSegmentUpdateBody)(data),
        });
        return new HelixScheduleSegment_1.HelixScheduleSegment(result.data.segments[0], this._client);
    }
    /**
     * Deletes a segment in a given broadcaster's schedule.
     *
     * @param broadcaster The broadcaster to create a new schedule segment for.
     * @param segmentId The ID of the segment to update.
     */
    async deleteScheduleSegment(broadcaster, segmentId) {
        await this._client.callApi({
            type: 'helix',
            url: 'schedule/segment',
            method: 'DELETE',
            userId: (0, common_1.extractUserId)(broadcaster),
            scopes: ['channel:manage:schedule'],
            query: (0, schedule_external_1.createScheduleSegmentModifyQuery)(broadcaster, segmentId),
        });
    }
}
exports.HelixScheduleApi = HelixScheduleApi;
