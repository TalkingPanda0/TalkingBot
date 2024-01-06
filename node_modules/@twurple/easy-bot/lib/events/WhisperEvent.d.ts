import { type HelixUser } from '@twurple/api';
/**
 * An event representing a whisper message.
 *
 * @meta category events
 */
export declare class WhisperEvent {
    /**
     * The ID of the user who sent the message.
     */
    get userId(): string;
    /**
     * The name of the user who sent the message.
     */
    get userName(): string;
    /**
     * The display name of the user who sent the message.
     */
    get userDisplayName(): string;
    /**
     * Gets more information about the user who sent the message.
     */
    getUser(): Promise<HelixUser>;
    /**
     * The text of the message.
     */
    get text(): string;
    /**
     * Replies to the message.
     *
     * @param text The text to send as a reply.
     */
    reply(text: string): Promise<void>;
}
//# sourceMappingURL=WhisperEvent.d.ts.map