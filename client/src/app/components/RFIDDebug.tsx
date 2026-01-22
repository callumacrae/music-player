"use client";

import type { AppRouter, RFIDTrpcMessage } from "@/common/api-types.mjs";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { useEffect, useState } from "react";

const RFIDDebug = () => {
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  useEffect(() => {
    const trpcClient = createTRPCClient<AppRouter>({
      links: [
        loggerLink(),
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            url: "http://localhost:4000/trpc",
          }),
          false: httpBatchLink({
            url: "http://localhost:4000/trpc",
          }),
        }),
      ],
    });

    const RFIDSubscription = trpcClient.getClient.subscribe(undefined, {
      onData(data) {
        setCurrentTag(data.value !== "" ? data.value : null);
      },
    });

    return () => {
      RFIDSubscription.unsubscribe();
    };
  }, []);

  return <p>Currently read tag: {currentTag || "No tag detected"}</p>;
};

export default RFIDDebug;
