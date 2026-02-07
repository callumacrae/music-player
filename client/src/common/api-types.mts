import * as _trpc_server from "@trpc/server";
import { SerialPort } from "serialport";
import { PortInfo } from "@serialport/bindings-interface";

type RFIDTag = {
  type: string;
  uid: string;
  device_name: string;
  known_tag: boolean;
};
type RFIDMessage = {
  messageType: "connected" | "disconnected" | "read" | "error";
  error?: unknown;
  data?: RFIDTag;
};
type RFIDInterfaceConstructorArgs = {
  vendorId?: string;
  productId?: string;
  baud?: number;
  callback?: (msg: RFIDMessage) => void;
};
declare class RFIDInterface {
  portInterface: SerialPort | undefined;
  device: PortInfo | undefined;
  sendMessage: (msg: RFIDMessage) => void;
  vendor: string;
  product: string;
  baudRate: number;
  connected: boolean;
  timeout: NodeJS.Timeout | null;
  currentTag: string | null;
  constructor({
    vendorId,
    productId,
    baud,
    callback,
  }: RFIDInterfaceConstructorArgs);
  portClosed(data: Error | null): void;
  controlMedia(msg: RFIDMessage): Promise<void>;
  setCallback(callback: (msg: RFIDMessage) => void): void;
  messageCallback: (msg: RFIDMessage) => void;
  init(): Promise<void>;
  portOpen(): Promise<void>;
  findDevice(
    vendorId: string,
    productId: string,
  ): Promise<PortInfo | undefined>;
  destroy(): Promise<void>;
}

type RFIDTrpcMessage = {
  value: string;
  error?: string;
};
declare const getAppRouter: (
  rfidReader: RFIDInterface,
) => _trpc_server.TRPCBuiltRouter<
  {
    ctx: {};
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
  },
  _trpc_server.TRPCDecorateCreateRouterOptions<{
    getClient: _trpc_server.TRPCSubscriptionProcedure<{
      input: void;
      output: AsyncIterable<RFIDTrpcMessage, void, any>;
      meta: object;
    }>;
    getCurrentTag: _trpc_server.TRPCQueryProcedure<{
      input: void;
      output: RFIDTrpcMessage;
      meta: object;
    }>;
  }>
>;
type AppRouter = ReturnType<typeof getAppRouter>;

export type { AppRouter, RFIDTrpcMessage };
