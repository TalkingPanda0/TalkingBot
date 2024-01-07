import { type HelixUserType } from '@twurple/common';
import { type PubSubChatMessageBadge, type PubSubChatMessageEmote } from './PubSubMessage.external';
/** @private */
export interface PubSubWhisperTags {
    login: string;
    display_name: string;
    color: string;
    user_type: HelixUserType;
    emotes: PubSubChatMessageEmote[];
    badges: PubSubChatMessageBadge[];
}
/** @private */
export interface PubSubWhisperRecipient {
    id: number;
    username: string;
    display_name: string;
    color: string;
    user_type: HelixUserType;
    badges: PubSubChatMessageBadge[];
    profile_image: string | null;
}
/** @private */
export interface PubSubWhisperMessageContent {
    id: number;
    message_id: string;
    thread_id: string;
    body: string;
    sent_ts: number;
    from_id: number;
    tags: PubSubWhisperTags;
    recipient: PubSubWhisperRecipient;
}
/** @private */
export interface PubSubWhisperMessageData {
    type: 'whisper_received';
    data: string;
    data_object: PubSubWhisperMessageContent;
}
//# sourceMappingURL=PubSubWhisperMessage.external.d.ts.map