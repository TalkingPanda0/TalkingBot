// Original file: streamlist.proto

import type { PageInfo as _youtube_api_v3_PageInfo, PageInfo__Output as _youtube_api_v3_PageInfo__Output } from '../../../youtube/api/v3/PageInfo';
import type { LiveChatMessage as _youtube_api_v3_LiveChatMessage, LiveChatMessage__Output as _youtube_api_v3_LiveChatMessage__Output } from '../../../youtube/api/v3/LiveChatMessage';

export interface LiveChatMessageListResponse {
  'offline_at'?: (string);
  'kind'?: (string);
  'etag'?: (string);
  'page_info'?: (_youtube_api_v3_PageInfo | null);
  'items'?: (_youtube_api_v3_LiveChatMessage)[];
  'active_poll_item'?: (_youtube_api_v3_LiveChatMessage | null);
  'next_page_token'?: (string);
}

export interface LiveChatMessageListResponse__Output {
  'offline_at'?: (string);
  'kind'?: (string);
  'etag'?: (string);
  'page_info'?: (_youtube_api_v3_PageInfo__Output);
  'items'?: (_youtube_api_v3_LiveChatMessage__Output)[];
  'active_poll_item'?: (_youtube_api_v3_LiveChatMessage__Output);
  'next_page_token'?: (string);
}
