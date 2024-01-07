import { ChatMessage } from "./commands/ChatMessage.mjs";
/** @private */
export function extractMessageId(message) {
    return message instanceof ChatMessage ? message.tags.get('id') : message;
}
