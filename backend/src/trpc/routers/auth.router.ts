import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { AuthService } from '../../auth/auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  contrasena: z.string().min(6),
  rol: z.enum(['egresado', 'empresa']),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  carrera: z.string().optional(),
  razon_social: z.string().optional(),
  ruc: z.string().optional(),
});

@Injectable()
export class AuthRouter {
  constructor(private trpc: TrpcService, private authService: AuthService) {}

  router = this.trpc.router({
    login: this.trpc.procedure
      .input(z.object({ email: z.string().email(), contrasena: z.string().min(6) }))
      .mutation(async ({ input }) => this.authService.login(input as any)),
    register: this.trpc.procedure
      .input(registerSchema)
      .mutation(async ({ input }) => this.authService.register(input as any)),
    refresh: this.trpc.procedure
      .input(z.object({ refreshToken: z.string() }))
      .mutation(async ({ input }) => this.authService.refreshToken(input.refreshToken)),
  });
}