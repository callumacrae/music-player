import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { getAppRouter, createContext } from "@/router";
import cors from "cors";
import RFIDInterface from "./RFIDInterface";

const rfidInterface = new RFIDInterface({});

async function main() {
  const app = express();
  const corsOptions = {
    origin: ["http://localhost:3000"],
  };
  app.use(cors(corsOptions));
  app.use(
    "/",
    trpcExpress.createExpressMiddleware({
      router: getAppRouter(rfidInterface),
      createContext,
    }),
  );
  app.listen(4000);
}

main();
