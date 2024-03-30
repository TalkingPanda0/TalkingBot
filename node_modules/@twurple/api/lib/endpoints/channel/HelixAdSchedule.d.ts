import { DataObject } from '@twurple/common';
import type { HelixAdScheduleData } from '../../interfaces/endpoints/channel.external';
/**
 * Represents a broadcaster's ad schedule.
 */
export declare class HelixAdSchedule extends DataObject<HelixAdScheduleData> {
    /**
     * The number of snoozes available for the broadcaster.
     */
    get snoozeCount(): number;
    /**
     * The date and time when the broadcaster will gain an additional snooze.
     */
    get snoozeRefreshDate(): Date;
    /**
     * The date and time of the broadcaster's next scheduled ad.
     */
    get nextAdDate(): Date;
    /**
     * The length in seconds of the scheduled upcoming ad break.
     */
    get duration(): number;
    /**
     * The date and time of the broadcaster's last ad-break.
     */
    get lastAdDate(): Date;
    /**
     * The amount of pre-roll free time remaining for the channel in seconds.
     */
    get prerollFreeTime(): number;
}
//# sourceMappingURL=HelixAdSchedule.d.ts.map