// Original file: streamlist.proto

import type { SuperStickerMetadata as _youtube_api_v3_SuperStickerMetadata, SuperStickerMetadata__Output as _youtube_api_v3_SuperStickerMetadata__Output } from '../../../youtube/api/v3/SuperStickerMetadata';
import type { Long } from '@grpc/proto-loader';

export interface LiveChatSuperStickerDetails {
  'amount_micros'?: (number | string | Long);
  'currency'?: (string);
  'amount_display_string'?: (string);
  'tier'?: (number);
  'super_sticker_metadata'?: (_youtube_api_v3_SuperStickerMetadata | null);
}

export interface LiveChatSuperStickerDetails__Output {
  'amount_micros'?: (Long);
  'currency'?: (string);
  'amount_display_string'?: (string);
  'tier'?: (number);
  'super_sticker_metadata'?: (_youtube_api_v3_SuperStickerMetadata__Output);
}
