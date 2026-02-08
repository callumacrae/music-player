import * as trpcExpress from "@trpc/server/adapters/express";
import { initTRPC } from "@trpc/server";
import RFIDInterface, { RFIDMessage } from "@/RFIDInterface.js";
import EventEmitter, { on } from "node:events";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export type RFIDTrpcMessage = { value: string; error?: string };

const ee = new EventEmitter();

let currentTag: string | null = null;
let rfidInterface: RFIDInterface | null = null;

const messageCallback = (msg: RFIDMessage) => {
  console.log(msg);
  if (msg.messageType === "read") {
    console.log("rfid read message:", msg);
    currentTag = msg?.data?.uid || "";
    const tagRead: RFIDTrpcMessage = { value: currentTag };

    ee.emit("rfidtagupdate", tagRead);
  } else if (msg.messageType === "error") {
    ee.emit("rfidtagupdate", {
      value: "error",
      error: "Reader connection lost",
    });
  }
};

export const getAppRouter = (rfidReader: RFIDInterface) => {
  rfidInterface = rfidReader;
  rfidInterface.setCallback(messageCallback);
  return t.router({
    getClient: t.procedure.subscription(async function* (opts) {
      try {
        if (rfidInterface) {
          await rfidInterface.destroy();
          rfidInterface = null;
          currentTag = null;
        }
      } catch (e) {
        console.log("error instantiating interface");
        ee.emit("rfidtagupdate", { value: "error" });
      }
      try {
        for await (const [data] of on(ee, "rfidtagupdate", {
          signal: opts.signal,
        })) {
          const tagMessage = data as RFIDTrpcMessage;
          yield tagMessage;
        }
      } finally {
        rfidInterface?.destroy();
      }
    }),
    getCurrentTag: t.procedure.query((): RFIDTrpcMessage => {
      return { value: currentTag || "" };
    }),
  });
};

export type AppRouter = ReturnType<typeof getAppRouter>;
