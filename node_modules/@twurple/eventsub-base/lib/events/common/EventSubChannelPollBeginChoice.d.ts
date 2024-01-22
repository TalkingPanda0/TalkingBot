import { DataObject } from '@twurple/common';
import { type EventSubChannelPollBeginChoiceData } from './EventSubChannelPollBeginChoice.external';
/**
 * A choice in a poll, as defined when beginning that poll.
 */
export declare class EventSubChannelPollBeginChoice extends DataObject<EventSubChannelPollBeginChoiceData> {
    /**
     * The ID of the choice.
     */
    get id(): string;
    /**
     * The title of the choice.
     */
    get title(): string;
}
//# sourceMappingURL=EventSubChannelPollBeginChoice.d.ts.map