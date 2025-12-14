import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/generated/rfidService";
import { WatchRequest } from "./proto/generated/WatchRequest";
import { WatchResponse } from "./proto/generated/WatchResponse";
import RFIDInterface, { RFIDMessage } from "./RFIDInterface";
import { time } from "console";

const PROTO_PATH = "./dist/proto/rfidService.proto";

async function main() {
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
    ) {
      let currentTag: string | null = null;
      let timeout: NodeJS.Timeout | null = null;
      new RFIDInterface({
        callback: (msg: RFIDMessage) => {
          if (msg.messageType === "read") {
            if (timeout) {
              clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
              timeout = null;
              currentTag = msg.data?.uid || null;
              callback(null, { value: "" });
            }, 300);
            if (msg.data?.uid === "string" && currentTag !== msg.data?.uid) {
              const tagRead: WatchResponse = { value: msg.data.uid };
              callback(null, tagRead);
            }
          }
        },
      });
    }
  }
  const server = new gRPC();

  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("gRPC service started");
      }
    },
  );
}

main();
