// Original file: streamlist.proto

import type { ChannelProfileDetails as _youtube_api_v3_ChannelProfileDetails, ChannelProfileDetails__Output as _youtube_api_v3_ChannelProfileDetails__Output } from '../../../youtube/api/v3/ChannelProfileDetails';
import type { SuperStickerMetadata as _youtube_api_v3_SuperStickerMetadata, SuperStickerMetadata__Output as _youtube_api_v3_SuperStickerMetadata__Output } from '../../../youtube/api/v3/SuperStickerMetadata';
import type { Long } from '@grpc/proto-loader';

export interface SuperChatEventSnippet {
  'supporter_details'?: (_youtube_api_v3_ChannelProfileDetails | null);
  'comment_text'?: (string);
  'created_at'?: (string);
  'amount_micros'?: (number | string | Long);
  'currency'?: (string);
  'display_string'?: (string);
  'message_type'?: (number);
  'is_super_sticker_event'?: (boolean);
  'super_sticker_metadata'?: (_youtube_api_v3_SuperStickerMetadata | null);
  'channel_id'?: (string);
}

export interface SuperChatEventSnippet__Output {
  'supporter_details'?: (_youtube_api_v3_ChannelProfileDetails__Output);
  'comment_text'?: (string);
  'created_at'?: (string);
  'amount_micros'?: (Long);
  'currency'?: (string);
  'display_string'?: (string);
  'message_type'?: (number);
  'is_super_sticker_event'?: (boolean);
  'super_sticker_metadata'?: (_youtube_api_v3_SuperStickerMetadata__Output);
  'channel_id'?: (string);
}
