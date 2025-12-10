import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { RFIDReaderServiceClient as _RFIDReaderServiceClient, RFIDReaderServiceDefinition as _RFIDReaderServiceDefinition } from './RFIDReaderService';
import type { WatchCancelRequest as _WatchCancelRequest, WatchCancelRequest__Output as _WatchCancelRequest__Output } from './WatchCancelRequest';
import type { WatchCreateRequest as _WatchCreateRequest, WatchCreateRequest__Output as _WatchCreateRequest__Output } from './WatchCreateRequest';
import type { WatchRequest as _WatchRequest, WatchRequest__Output as _WatchRequest__Output } from './WatchRequest';
import type { WatchResponse as _WatchResponse, WatchResponse__Output as _WatchResponse__Output } from './WatchResponse';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  RFIDReaderService: SubtypeConstructor<typeof grpc.Client, _RFIDReaderServiceClient> & { service: _RFIDReaderServiceDefinition }
  WatchCancelRequest: MessageTypeDefinition<_WatchCancelRequest, _WatchCancelRequest__Output>
  WatchCreateRequest: MessageTypeDefinition<_WatchCreateRequest, _WatchCreateRequest__Output>
  WatchRequest: MessageTypeDefinition<_WatchRequest, _WatchRequest__Output>
  WatchResponse: MessageTypeDefinition<_WatchResponse, _WatchResponse__Output>
}

