// Original file: streamlist.proto

import type { ChannelProfileDetails as _youtube_api_v3_ChannelProfileDetails, ChannelProfileDetails__Output as _youtube_api_v3_ChannelProfileDetails__Output } from '../../../youtube/api/v3/ChannelProfileDetails';
import type { Long } from '@grpc/proto-loader';

// Original file: streamlist.proto

export const _youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper_BanType = {
  PERMANENT: 1,
  TEMPORARY: 2,
} as const;

export type _youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper_BanType =
  | 'PERMANENT'
  | 1
  | 'TEMPORARY'
  | 2

export type _youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper_BanType__Output = typeof _youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper_BanType[keyof typeof _youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper_BanType]

export interface _youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper {
}

export interface _youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper__Output {
}

export interface LiveChatUserBannedMessageDetails {
  'banned_user_details'?: (_youtube_api_v3_ChannelProfileDetails | null);
  'ban_type'?: (_youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper_BanType);
  'ban_duration_seconds'?: (number | string | Long);
}

export interface LiveChatUserBannedMessageDetails__Output {
  'banned_user_details'?: (_youtube_api_v3_ChannelProfileDetails__Output);
  'ban_type'?: (_youtube_api_v3_LiveChatUserBannedMessageDetails_BanTypeWrapper_BanType__Output);
  'ban_duration_seconds'?: (Long);
}
