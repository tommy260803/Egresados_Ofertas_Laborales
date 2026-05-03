import { fetchRequestHandler } from '@trpc/server/adapters/nextjs';

export async function createContext(req: Request) {
  // Extract token from headers
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  return {
    req,
    token,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
