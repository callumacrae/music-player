// Original file: src/proto/rfidService.proto

import type { WatchCreateRequest as _WatchCreateRequest, WatchCreateRequest__Output as _WatchCreateRequest__Output } from './WatchCreateRequest';
import type { WatchCancelRequest as _WatchCancelRequest, WatchCancelRequest__Output as _WatchCancelRequest__Output } from './WatchCancelRequest';

export interface WatchRequest {
  'createRequest'?: (_WatchCreateRequest | null);
  'cancelRequest'?: (_WatchCancelRequest | null);
  'request'?: "createRequest"|"cancelRequest";
}

export interface WatchRequest__Output {
  'createRequest'?: (_WatchCreateRequest__Output);
  'cancelRequest'?: (_WatchCancelRequest__Output);
  'request'?: "createRequest"|"cancelRequest";
}
