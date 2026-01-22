"use client";

import type { AppRouter, RFIDTrpcMessage } from "@/common/api-types.mjs";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { useEffect, useRef, useState } from "react";

type TTrpcClient = ReturnType<typeof createTRPCClient<AppRouter>>;

const RFIDDebug = () => {
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const trpcClient = useRef<TTrpcClient | null>(null);
  const rfidSubscription = useRef<ReturnType<
    TTrpcClient["getClient"]["subscribe"]
  > | null>(null);
  useEffect(() => {
    initializeClient();

    return () => {
      rfidSubscription.current?.unsubscribe();
    };
  }, []);

  const initializeClient = () => {
    rfidSubscription.current?.unsubscribe();
    trpcClient.current = createTRPCClient<AppRouter>({
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
    rfidSubscription.current = trpcClient.current.getClient.subscribe(
      undefined,
      {
        onData(data) {
          if (data.error) {
            console.log(data);
            setConnected(false);
          } else {
            setConnected(true);
            setCurrentTag(data.value !== "" ? data.value : null);
          }
        },
        onStarted() {
          setConnected(true);
        },
        onError() {
          setConnected(false);
        },
      },
    );
  };

  return (
    <div>
      <p>Active connection: {connected ? "Connected" : "Disconnected"}</p>
      <p>Currently read tag: {currentTag || "No tag detected"}</p>
      {!connected && (
        <button
          style={{ background: "white", color: "black", cursor: "pointer" }}
          onClick={initializeClient}
        >
          Reconnect to sensor
        </button>
      )}
    </div>
  );
};

export default RFIDDebug;
