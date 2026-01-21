"use client";

import { AppRouter } from "@/common/api-types.mjs";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { useEffect } from "react";

const RFIDDebug = () => {
  useEffect(() => {
    const trpcClient = createTRPCClient<AppRouter>({
      links: [
        loggerLink(),
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            url: "http://localhost:4000/",
          }),
          false: httpBatchLink({
            url: "http://localhost:4000/",
          }),
        }),
      ],
    });

    const RFIDSubscription = trpcClient.getClient.subscribe(undefined, {});

    return () => {
      RFIDSubscription.unsubscribe();
    };
  }, []);

  return <p>Replace me when you're ready</p>;
};

export default RFIDDebug;
