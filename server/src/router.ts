import * as trpcExpress from "@trpc/server/adapters/express";
import { initTRPC, tracked } from "@trpc/server";
import RFIDInterface, { RFIDMessage } from "@/RFIDInterface.js";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export type RFIDTrpcMessage = { value: string };

export const appRouter = t.router({
  getClient: t.procedure.subscription(async function* (opts) {
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
            tracked(new Date().toJSON(), { value: "" });
          }, 300);
          if (msg.data?.uid === "string" && currentTag !== msg.data?.uid) {
            const tagRead: RFIDTrpcMessage = { value: msg.data.uid };

            tracked(new Date().toJSON(), tagRead);
          }
        }
      },
    });
  }),
});

export type AppRouter = typeof appRouter;
