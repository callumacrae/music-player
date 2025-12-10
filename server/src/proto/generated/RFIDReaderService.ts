// Original file: src/proto/rfidService.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { WatchRequest as _WatchRequest, WatchRequest__Output as _WatchRequest__Output } from './WatchRequest';
import type { WatchResponse as _WatchResponse, WatchResponse__Output as _WatchResponse__Output } from './WatchResponse';

export interface RFIDReaderServiceClient extends grpc.Client {
  Watch(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_WatchRequest, _WatchResponse__Output>;
  Watch(options?: grpc.CallOptions): grpc.ClientDuplexStream<_WatchRequest, _WatchResponse__Output>;
  watch(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_WatchRequest, _WatchResponse__Output>;
  watch(options?: grpc.CallOptions): grpc.ClientDuplexStream<_WatchRequest, _WatchResponse__Output>;
  
}

export interface RFIDReaderServiceHandlers extends grpc.UntypedServiceImplementation {
  Watch: grpc.handleBidiStreamingCall<_WatchRequest__Output, _WatchResponse>;
  
}

export interface RFIDReaderServiceDefinition extends grpc.ServiceDefinition {
  Watch: MethodDefinition<_WatchRequest, _WatchResponse, _WatchRequest__Output, _WatchResponse__Output>
}
