import { ChatMessage } from './commands/ChatMessage';
/**
 * Additional attributes for a channel message.
 */
export interface ChatSayMessageAttributes {
    /**
     * The message to reply to.
     */
    replyTo?: string | ChatMessage;
}
/** @private */
export declare function extractMessageId(message: string | ChatMessage): string;
//# sourceMappingURL=ChatMessageAttributes.d.ts.map