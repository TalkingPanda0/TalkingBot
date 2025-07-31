// Original file: streamlist.proto

import type { Long } from '@grpc/proto-loader';

export interface LiveChatSuperChatDetails {
  'amount_micros'?: (number | string | Long);
  'currency'?: (string);
  'amount_display_string'?: (string);
  'user_comment'?: (string);
  'tier'?: (number);
}

export interface LiveChatSuperChatDetails__Output {
  'amount_micros'?: (Long);
  'currency'?: (string);
  'amount_display_string'?: (string);
  'user_comment'?: (string);
  'tier'?: (number);
}
