// Original file: streamlist.proto

import type { LiveChatTextMessageDetails as _youtube_api_v3_LiveChatTextMessageDetails, LiveChatTextMessageDetails__Output as _youtube_api_v3_LiveChatTextMessageDetails__Output } from '../../../youtube/api/v3/LiveChatTextMessageDetails';
import type { LiveChatMessageDeletedDetails as _youtube_api_v3_LiveChatMessageDeletedDetails, LiveChatMessageDeletedDetails__Output as _youtube_api_v3_LiveChatMessageDeletedDetails__Output } from '../../../youtube/api/v3/LiveChatMessageDeletedDetails';
import type { LiveChatMessageRetractedDetails as _youtube_api_v3_LiveChatMessageRetractedDetails, LiveChatMessageRetractedDetails__Output as _youtube_api_v3_LiveChatMessageRetractedDetails__Output } from '../../../youtube/api/v3/LiveChatMessageRetractedDetails';
import type { LiveChatUserBannedMessageDetails as _youtube_api_v3_LiveChatUserBannedMessageDetails, LiveChatUserBannedMessageDetails__Output as _youtube_api_v3_LiveChatUserBannedMessageDetails__Output } from '../../../youtube/api/v3/LiveChatUserBannedMessageDetails';
import type { LiveChatSuperChatDetails as _youtube_api_v3_LiveChatSuperChatDetails, LiveChatSuperChatDetails__Output as _youtube_api_v3_LiveChatSuperChatDetails__Output } from '../../../youtube/api/v3/LiveChatSuperChatDetails';
import type { LiveChatSuperStickerDetails as _youtube_api_v3_LiveChatSuperStickerDetails, LiveChatSuperStickerDetails__Output as _youtube_api_v3_LiveChatSuperStickerDetails__Output } from '../../../youtube/api/v3/LiveChatSuperStickerDetails';
import type { LiveChatNewSponsorDetails as _youtube_api_v3_LiveChatNewSponsorDetails, LiveChatNewSponsorDetails__Output as _youtube_api_v3_LiveChatNewSponsorDetails__Output } from '../../../youtube/api/v3/LiveChatNewSponsorDetails';
import type { LiveChatMemberMilestoneChatDetails as _youtube_api_v3_LiveChatMemberMilestoneChatDetails, LiveChatMemberMilestoneChatDetails__Output as _youtube_api_v3_LiveChatMemberMilestoneChatDetails__Output } from '../../../youtube/api/v3/LiveChatMemberMilestoneChatDetails';
import type { LiveChatMembershipGiftingDetails as _youtube_api_v3_LiveChatMembershipGiftingDetails, LiveChatMembershipGiftingDetails__Output as _youtube_api_v3_LiveChatMembershipGiftingDetails__Output } from '../../../youtube/api/v3/LiveChatMembershipGiftingDetails';
import type { LiveChatGiftMembershipReceivedDetails as _youtube_api_v3_LiveChatGiftMembershipReceivedDetails, LiveChatGiftMembershipReceivedDetails__Output as _youtube_api_v3_LiveChatGiftMembershipReceivedDetails__Output } from '../../../youtube/api/v3/LiveChatGiftMembershipReceivedDetails';
import type { LiveChatPollDetails as _youtube_api_v3_LiveChatPollDetails, LiveChatPollDetails__Output as _youtube_api_v3_LiveChatPollDetails__Output } from '../../../youtube/api/v3/LiveChatPollDetails';

// Original file: streamlist.proto

export const _youtube_api_v3_LiveChatMessageSnippet_TypeWrapper_Type = {
  INVALID_TYPE: 0,
  TEXT_MESSAGE_EVENT: 1,
  TOMBSTONE: 2,
  FAN_FUNDING_EVENT: 3,
  CHAT_ENDED_EVENT: 4,
  SPONSOR_ONLY_MODE_STARTED_EVENT: 5,
  SPONSOR_ONLY_MODE_ENDED_EVENT: 6,
  NEW_SPONSOR_EVENT: 7,
  MEMBER_MILESTONE_CHAT_EVENT: 17,
  MEMBERSHIP_GIFTING_EVENT: 18,
  GIFT_MEMBERSHIP_RECEIVED_EVENT: 19,
  MESSAGE_DELETED_EVENT: 8,
  MESSAGE_RETRACTED_EVENT: 9,
  USER_BANNED_EVENT: 10,
  SUPER_CHAT_EVENT: 15,
  SUPER_STICKER_EVENT: 16,
  POLL_EVENT: 20,
} as const;

export type _youtube_api_v3_LiveChatMessageSnippet_TypeWrapper_Type =
  | 'INVALID_TYPE'
  | 0
  | 'TEXT_MESSAGE_EVENT'
  | 1
  | 'TOMBSTONE'
  | 2
  | 'FAN_FUNDING_EVENT'
  | 3
  | 'CHAT_ENDED_EVENT'
  | 4
  | 'SPONSOR_ONLY_MODE_STARTED_EVENT'
  | 5
  | 'SPONSOR_ONLY_MODE_ENDED_EVENT'
  | 6
  | 'NEW_SPONSOR_EVENT'
  | 7
  | 'MEMBER_MILESTONE_CHAT_EVENT'
  | 17
  | 'MEMBERSHIP_GIFTING_EVENT'
  | 18
  | 'GIFT_MEMBERSHIP_RECEIVED_EVENT'
  | 19
  | 'MESSAGE_DELETED_EVENT'
  | 8
  | 'MESSAGE_RETRACTED_EVENT'
  | 9
  | 'USER_BANNED_EVENT'
  | 10
  | 'SUPER_CHAT_EVENT'
  | 15
  | 'SUPER_STICKER_EVENT'
  | 16
  | 'POLL_EVENT'
  | 20

export type _youtube_api_v3_LiveChatMessageSnippet_TypeWrapper_Type__Output = typeof _youtube_api_v3_LiveChatMessageSnippet_TypeWrapper_Type[keyof typeof _youtube_api_v3_LiveChatMessageSnippet_TypeWrapper_Type]

export interface _youtube_api_v3_LiveChatMessageSnippet_TypeWrapper {
}

export interface _youtube_api_v3_LiveChatMessageSnippet_TypeWrapper__Output {
}

export interface LiveChatMessageSnippet {
  'type'?: (_youtube_api_v3_LiveChatMessageSnippet_TypeWrapper_Type);
  'published_at'?: (string);
  'display_message'?: (string);
  'has_display_content'?: (boolean);
  'text_message_details'?: (_youtube_api_v3_LiveChatTextMessageDetails | null);
  'message_deleted_details'?: (_youtube_api_v3_LiveChatMessageDeletedDetails | null);
  'message_retracted_details'?: (_youtube_api_v3_LiveChatMessageRetractedDetails | null);
  'user_banned_details'?: (_youtube_api_v3_LiveChatUserBannedMessageDetails | null);
  'super_chat_details'?: (_youtube_api_v3_LiveChatSuperChatDetails | null);
  'super_sticker_details'?: (_youtube_api_v3_LiveChatSuperStickerDetails | null);
  'new_sponsor_details'?: (_youtube_api_v3_LiveChatNewSponsorDetails | null);
  'member_milestone_chat_details'?: (_youtube_api_v3_LiveChatMemberMilestoneChatDetails | null);
  'membership_gifting_details'?: (_youtube_api_v3_LiveChatMembershipGiftingDetails | null);
  'gift_membership_received_details'?: (_youtube_api_v3_LiveChatGiftMembershipReceivedDetails | null);
  'poll_details'?: (_youtube_api_v3_LiveChatPollDetails | null);
  'live_chat_id'?: (string);
  'author_channel_id'?: (string);
  'displayed_content'?: "text_message_details"|"message_deleted_details"|"message_retracted_details"|"user_banned_details"|"super_chat_details"|"super_sticker_details"|"new_sponsor_details"|"member_milestone_chat_details"|"membership_gifting_details"|"gift_membership_received_details"|"poll_details";
}

export interface LiveChatMessageSnippet__Output {
  'type'?: (_youtube_api_v3_LiveChatMessageSnippet_TypeWrapper_Type__Output);
  'published_at'?: (string);
  'display_message'?: (string);
  'has_display_content'?: (boolean);
  'text_message_details'?: (_youtube_api_v3_LiveChatTextMessageDetails__Output);
  'message_deleted_details'?: (_youtube_api_v3_LiveChatMessageDeletedDetails__Output);
  'message_retracted_details'?: (_youtube_api_v3_LiveChatMessageRetractedDetails__Output);
  'user_banned_details'?: (_youtube_api_v3_LiveChatUserBannedMessageDetails__Output);
  'super_chat_details'?: (_youtube_api_v3_LiveChatSuperChatDetails__Output);
  'super_sticker_details'?: (_youtube_api_v3_LiveChatSuperStickerDetails__Output);
  'new_sponsor_details'?: (_youtube_api_v3_LiveChatNewSponsorDetails__Output);
  'member_milestone_chat_details'?: (_youtube_api_v3_LiveChatMemberMilestoneChatDetails__Output);
  'membership_gifting_details'?: (_youtube_api_v3_LiveChatMembershipGiftingDetails__Output);
  'gift_membership_received_details'?: (_youtube_api_v3_LiveChatGiftMembershipReceivedDetails__Output);
  'poll_details'?: (_youtube_api_v3_LiveChatPollDetails__Output);
  'live_chat_id'?: (string);
  'author_channel_id'?: (string);
}
