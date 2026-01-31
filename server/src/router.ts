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
let timeout: NodeJS.Timeout | null = null;

const messageCallback = (msg: RFIDMessage) => {
  if (msg.messageType === "read") {
    console.log("rfid read message:", msg);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      currentTag = null;
      ee.emit("rfidtagupdate", { value: "" });
    }, 300);
    if (typeof msg.data?.uid === "string" && currentTag !== msg.data?.uid) {
      currentTag = msg.data.uid;
      const tagRead: RFIDTrpcMessage = { value: msg.data.uid };

      ee.emit("rfidtagupdate", tagRead);
    }
  } else if (msg.messageType === "error") {
    ee.emit("rfidtagupdate", {
      value: "error",
      error: "Reader connection lost",
    });
  }
};

const getRfidInterfaceInstance = async () => {
  rfidInterface = new RFIDInterface({
    callback: messageCallback,
  });
  rfidInterface
    .init()
    .then(() => {
      ee.emit("rfidtagupdate", { value: "" });
    })
    .catch((e) => {
      console.log("initialisation failed", e.message);
      ee.emit("rfidtagupdate", { value: "error", error: e.message });
    });
};

export const appRouter = t.router({
  getClient: t.procedure.subscription(async function* (opts) {
    try {
      if (rfidInterface) {
        await rfidInterface.destroy();
        rfidInterface = null;
        currentTag = null;
      }
      getRfidInterfaceInstance();
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
  reinitialiseInterface: t.procedure.query(() => {
    getRfidInterfaceInstance();
  }),
});

export type AppRouter = typeof appRouter;
