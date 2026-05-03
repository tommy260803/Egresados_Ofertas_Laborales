import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from '../context';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // Add your procedures here
  hello: t.procedure.query(() => {
    return {
      greeting: 'Hello from tRPC!',
    };
  }),
});

export type AppRouter = typeof appRouter;
