import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/generated/rfidService";
import { WatchRequest } from "./proto/generated/WatchRequest";
import { WatchResponse } from "./proto/generated/WatchResponse";

const PROTO_PATH = "./dist/proto/rfidService.proto";

const packageDefinition = await protoLoader.load(PROTO_PATH, {
  keepCase: true,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(
  packageDefinition,
) as unknown as ProtoGrpcType;

const RFIDReaderService = protoDescriptor.RFIDReaderService;

class gRPC extends grpc.Server {
  constructor() {
    super();
    this.addService(RFIDReaderService.service, {
      client: this.getClient,
    });
  }

  protected getClient(
    call: grpc.ServerUnaryCall<WatchRequest, WatchResponse>,
    callback: grpc.sendUnaryData<WatchResponse>,
  ) {}
}

function main() {
  const server = new gRPC();
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log();
      }
    },
  );
}

main();
