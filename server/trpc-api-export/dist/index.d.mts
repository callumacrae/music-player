import * as _trpc_server from "@trpc/server";

type RFIDTrpcMessage = {
  value: string;
  error?: string;
};
declare const appRouter: _trpc_server.TRPCBuiltRouter<
  {
    ctx: {};
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
  },
  _trpc_server.TRPCDecorateCreateRouterOptions<{
    getClient: _trpc_server.TRPCSubscriptionProcedure<{
      input: void;
      output: AsyncIterable<RFIDTrpcMessage, void, any>;
      meta: object;
    }>;
    getCurrentTag: _trpc_server.TRPCQueryProcedure<{
      input: void;
      output: RFIDTrpcMessage;
      meta: object;
    }>;
    reinitialiseInterface: _trpc_server.TRPCQueryProcedure<{
      input: void;
      output: void;
      meta: object;
    }>;
  }>
>;
type AppRouter = typeof appRouter;

export type { AppRouter, RFIDTrpcMessage };
