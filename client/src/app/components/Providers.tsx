"use client";

import { AppRouter, RFIDTrpcMessage } from "@/common/api-types.mjs";
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
  reading: boolean;
  initializeClient: () => void;
  getCurrentTag: () => Promise<RFIDTrpcMessage>;
  startRFID: () => void;
};

export const RFIDContext = createContext<TRFIDContext>({
  currentTag: "",
  connected: false,
  reading: false,
  initializeClient: () => {},
  getCurrentTag: async (): Promise<RFIDTrpcMessage> => {
    return { value: "" };
  },
  startRFID: () => {},
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  const trpcClient = useRef<TTrpcClient | null>(null);
  const rfidSubscription = useRef<TRPCClientSubscription | null>(null);
  const [connected, setConnected] = useState(false);
  const [reading, setReading] = useState(false);
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
            setReading(false);
          } else {
            setReading(true);
            setCurrentTag(data.value !== "" ? data.value : null);
          }
        },
        onError() {
          setConnected(false);
        },
        onStarted() {
          setConnected(true);
        },
        onStopped() {
          setConnected(false);
        },
        onComplete() {
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

  const getCurrentTag = async () => {
    if (trpcClient.current?.getCurrentTag) {
      return await trpcClient.current?.getCurrentTag.query();
    } else {
      return { value: "" };
    }
  };

  const startRFID = () => {
    if (trpcClient.current?.reinitialiseInterface) {
      trpcClient.current.reinitialiseInterface.query();
    }
  };

  return (
    <RFIDContext.Provider
      value={{
        currentTag,
        connected,
        initializeClient,
        getCurrentTag,
        startRFID,
        reading,
      }}
    >
      {children}
    </RFIDContext.Provider>
  );
};

export default Providers;
