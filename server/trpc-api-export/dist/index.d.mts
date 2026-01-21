import * as _trpc_server from "@trpc/server";

type RFIDTrpcMessage = {
  value: string;
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
      output: AsyncIterable<never, void, any>;
      meta: object;
    }>;
  }>
>;
type AppRouter = typeof appRouter;

export type { AppRouter, RFIDTrpcMessage };
