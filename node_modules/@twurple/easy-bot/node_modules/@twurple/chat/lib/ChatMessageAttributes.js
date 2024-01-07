"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMessageId = void 0;
const ChatMessage_1 = require("./commands/ChatMessage");
/** @private */
function extractMessageId(message) {
    return message instanceof ChatMessage_1.ChatMessage ? message.tags.get('id') : message;
}
exports.extractMessageId = extractMessageId;
