import { __decorate } from "tslib";
// import { Enumerable } from '@d-fischer/shared-utils';
import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
// import type { HelixUser } from '../user/HelixUser';
/**
 * Represents a broadcaster's ad schedule.
 */
let HelixAdSchedule = class HelixAdSchedule extends DataObject {
    /**
     * The number of snoozes available for the broadcaster.
     */
    get snoozeCount() {
        return this[rawDataSymbol].snooze_count;
    }
    /**
     * The date and time when the broadcaster will gain an additional snooze.
     */
    get snoozeRefreshDate() {
        return new Date(this[rawDataSymbol].snooze_refresh_at * 1000);
    }
    /**
     * The date and time of the broadcaster's next scheduled ad.
     */
    get nextAdDate() {
        return new Date(this[rawDataSymbol].next_ad_at * 1000);
    }
    /**
     * The length in seconds of the scheduled upcoming ad break.
     */
    get duration() {
        return this[rawDataSymbol].duration;
    }
    /**
     * The date and time of the broadcaster's last ad-break.
     */
    get lastAdDate() {
        return new Date(this[rawDataSymbol].last_ad_at * 1000);
    }
    /**
     * The amount of pre-roll free time remaining for the channel in seconds.
     */
    get prerollFreeTime() {
        return this[rawDataSymbol].preroll_free_time;
    }
};
HelixAdSchedule = __decorate([
    rtfm('api', 'HelixAdSchedule')
], HelixAdSchedule);
export { HelixAdSchedule };
