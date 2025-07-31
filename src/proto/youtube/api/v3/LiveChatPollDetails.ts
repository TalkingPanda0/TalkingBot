// Original file: streamlist.proto

import type { Long } from '@grpc/proto-loader';

export interface _youtube_api_v3_LiveChatPollDetails_PollMetadata {
  'question_text'?: (string);
  'options'?: (_youtube_api_v3_LiveChatPollDetails_PollMetadata_PollOption)[];
}

export interface _youtube_api_v3_LiveChatPollDetails_PollMetadata__Output {
  'question_text'?: (string);
  'options'?: (_youtube_api_v3_LiveChatPollDetails_PollMetadata_PollOption__Output)[];
}

export interface _youtube_api_v3_LiveChatPollDetails_PollMetadata_PollOption {
  'option_text'?: (string);
  'tally'?: (number | string | Long);
}

export interface _youtube_api_v3_LiveChatPollDetails_PollMetadata_PollOption__Output {
  'option_text'?: (string);
  'tally'?: (Long);
}

// Original file: streamlist.proto

export const _youtube_api_v3_LiveChatPollDetails_PollStatusWrapper_PollStatus = {
  UNKNOWN: 0,
  ACTIVE: 1,
  CLOSED: 2,
} as const;

export type _youtube_api_v3_LiveChatPollDetails_PollStatusWrapper_PollStatus =
  | 'UNKNOWN'
  | 0
  | 'ACTIVE'
  | 1
  | 'CLOSED'
  | 2

export type _youtube_api_v3_LiveChatPollDetails_PollStatusWrapper_PollStatus__Output = typeof _youtube_api_v3_LiveChatPollDetails_PollStatusWrapper_PollStatus[keyof typeof _youtube_api_v3_LiveChatPollDetails_PollStatusWrapper_PollStatus]

export interface _youtube_api_v3_LiveChatPollDetails_PollStatusWrapper {
}

export interface _youtube_api_v3_LiveChatPollDetails_PollStatusWrapper__Output {
}

export interface LiveChatPollDetails {
  'metadata'?: (_youtube_api_v3_LiveChatPollDetails_PollMetadata | null);
  'status'?: (_youtube_api_v3_LiveChatPollDetails_PollStatusWrapper_PollStatus);
}

export interface LiveChatPollDetails__Output {
  'metadata'?: (_youtube_api_v3_LiveChatPollDetails_PollMetadata__Output);
  'status'?: (_youtube_api_v3_LiveChatPollDetails_PollStatusWrapper_PollStatus__Output);
}
