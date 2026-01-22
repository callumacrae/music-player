import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter, createContext } from "@/router";
import cors from "cors";

async function main() {
  const app = express();
  const corsOptions = {
    origin: ["http://localhost:3000"],
  };
  app.use(cors(corsOptions));
  app.use(
    "/",
    trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
  );
  app.listen(4000);
}

main();
