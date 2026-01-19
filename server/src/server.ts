import * as trpcExpress from "@trpc/server/adapters/express";
import express, { Router } from "express";
import RFIDInterface, { RFIDMessage } from "@/RFIDInterface.js";
import { initTRPC, tracked } from "@trpc/server";

async function main() {
  const createContext = ({
    req,
    res,
  }: trpcExpress.CreateExpressContextOptions) => ({});
  type Context = Awaited<ReturnType<typeof createContext>>;
  const t = initTRPC.context<Context>().create();
  const appRouter = t.router({
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
              const tagRead = { value: msg.data.uid };

              tracked(new Date().toJSON(), tagRead);
            }
          }
        },
      });
    }),
  });
  const app = express();

  app.use(
    "/",
    trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
  );
  app.listen(4000);
}

main();
