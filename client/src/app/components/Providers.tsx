"use client";

import { AppRouter } from "@/common/api-types.mjs";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
export type TTrpcClient = ReturnType<typeof createTRPCClient<AppRouter>>;
export type TRPCClientSubscription = ReturnType<
  TTrpcClient["getClient"]["subscribe"]
>;

export type TRFIDContext = {
  currentTag: string | null;
  connected: boolean;
  initializeClient: () => void;
};

export const RFIDContext = createContext<TRFIDContext>({
  currentTag: "",
  connected: false,
  initializeClient: () => {},
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  const trpcClient = useRef<TTrpcClient | null>(null);
  const rfidSubscription = useRef<TRPCClientSubscription | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentTag, setCurrentTag] = useState<string | null>("");
  const initializeClient = useCallback(() => {
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
  }, [setConnected, setCurrentTag]);

  useEffect(() => {
    initializeClient();
    return () => {
      rfidSubscription.current?.unsubscribe();
    };
  }, [initializeClient]);

  return (
    <RFIDContext.Provider value={{ currentTag, connected, initializeClient }}>
      {children}
    </RFIDContext.Provider>
  );
};

export default Providers;
