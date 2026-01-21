import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter, createContext } from "@/router";

async function main() {
  const app = express();
  app.use(
    "/",
    trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
  );
  app.listen(4000);
}

main();
