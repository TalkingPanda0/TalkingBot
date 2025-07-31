// Original file: streamlist.proto

import type { Long } from '@grpc/proto-loader';

export interface LiveChatFanFundingEventDetails {
  'amount_micros'?: (number | string | Long);
  'currency'?: (string);
  'amount_display_string'?: (string);
  'user_comment'?: (string);
}

export interface LiveChatFanFundingEventDetails__Output {
  'amount_micros'?: (Long);
  'currency'?: (string);
  'amount_display_string'?: (string);
  'user_comment'?: (string);
}
