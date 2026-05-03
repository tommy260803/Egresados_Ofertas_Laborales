import { Injectable, Logger } from '@nestjs/common';
import { initTRPC } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

interface TrpcContext {
  req: unknown;
  res: unknown;
  user?: { userId: number; rol: 'administrador' | 'egresado' | 'empresa' };
}

@Injectable()
export class TrpcService {
  private readonly logger = new Logger(TrpcService.name);
  public trpc = initTRPC.context<TrpcContext>().create();

  createContext = ({ req, res }: CreateExpressContextOptions): TrpcContext => {
    const user = (req as any).user as { userId: number; rol: 'administrador' | 'egresado' | 'empresa' } | undefined;
    return { req, res, user };
  };

  get procedures() {
    return this.trpc.procedure;
  }

  get procedure() {
    return this.trpc.procedure;
  }

  get router() {
    return this.trpc.router;
  }

  get middleware() {
    return this.trpc.middleware;
  }
}