// Original file: streamlist.proto

import type { LiveChatMessageSnippet as _youtube_api_v3_LiveChatMessageSnippet, LiveChatMessageSnippet__Output as _youtube_api_v3_LiveChatMessageSnippet__Output } from '../../../youtube/api/v3/LiveChatMessageSnippet';
import type { LiveChatMessageAuthorDetails as _youtube_api_v3_LiveChatMessageAuthorDetails, LiveChatMessageAuthorDetails__Output as _youtube_api_v3_LiveChatMessageAuthorDetails__Output } from '../../../youtube/api/v3/LiveChatMessageAuthorDetails';

export interface LiveChatMessage {
  'snippet'?: (_youtube_api_v3_LiveChatMessageSnippet | null);
  'author_details'?: (_youtube_api_v3_LiveChatMessageAuthorDetails | null);
  'id'?: (string);
  'kind'?: (string);
  'etag'?: (string);
}

export interface LiveChatMessage__Output {
  'snippet'?: (_youtube_api_v3_LiveChatMessageSnippet__Output);
  'author_details'?: (_youtube_api_v3_LiveChatMessageAuthorDetails__Output);
  'id'?: (string);
  'kind'?: (string);
  'etag'?: (string);
}
