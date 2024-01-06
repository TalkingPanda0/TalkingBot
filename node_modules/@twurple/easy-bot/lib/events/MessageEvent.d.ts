import { type HelixUser } from '@twurple/api';
/**
 * An event representing a user sending a message to a channel's chat.
 *
 * @meta category events
 */
export declare class MessageEvent {
    /**
     * The ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The name of the broadcaster.
     */
    get broadcasterName(): string;
    /**
     * Gets more information about the broadcaster.
     */
    getBroadcaster(): Promise<HelixUser>;
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
     * The text that was sent.
     */
    get text(): string;
    /**
     * Whether the message is formatted as an action (sent using the /me chat command).
     */
    get isAction(): boolean;
    /**
     * The offsets of the emotes contained in the message.
     */
    get emoteOffsets(): Map<string, string[]>;
    /**
     * Replies to the message.
     *
     * @param text The text to send as a reply.
     */
    reply(text: string): Promise<void>;
    /**
     * Deletes the message.
     */
    delete(): Promise<void>;
}
//# sourceMappingURL=MessageEvent.d.ts.map