// Original file: streamlist.proto

import type { MethodDefinition } from '@grpc/proto-loader'
import type { LiveChatMessageListRequest as _youtube_api_v3_LiveChatMessageListRequest, LiveChatMessageListRequest__Output as _youtube_api_v3_LiveChatMessageListRequest__Output } from '../../../youtube/api/v3/LiveChatMessageListRequest';
import type { LiveChatMessageListResponse as _youtube_api_v3_LiveChatMessageListResponse, LiveChatMessageListResponse__Output as _youtube_api_v3_LiveChatMessageListResponse__Output } from '../../../youtube/api/v3/LiveChatMessageListResponse';

export interface V3DataLiveChatMessageServiceDefinition {
  StreamList: MethodDefinition<_youtube_api_v3_LiveChatMessageListRequest, _youtube_api_v3_LiveChatMessageListResponse, _youtube_api_v3_LiveChatMessageListRequest__Output, _youtube_api_v3_LiveChatMessageListResponse__Output>
}
