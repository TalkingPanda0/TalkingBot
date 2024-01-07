import { DataObject } from '@twurple/common';
import { type PubSubWhisperMessageData } from './PubSubWhisperMessage.external';
/**
 * A message informing about a whisper being received from another user.
 */
export declare class PubSubWhisperMessage extends DataObject<PubSubWhisperMessageData> {
    /**
     * The message text.
     */
    get text(): string;
    /**
     * The ID of the user who sent the whisper.
     */
    get senderId(): string;
    /**
     * The name of the user who sent the whisper.
     */
    get senderName(): string;
    /**
     * The display name of the user who sent the whisper.
     */
    get senderDisplayName(): string;
}
//# sourceMappingURL=PubSubWhisperMessage.d.ts.map