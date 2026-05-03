import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: number;
  email: string;
  rol: 'administrador' | 'egresado' | 'empresa';
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtMiddleware.name);
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    this.logger.log(`JWT Middleware - Authorization header: ${authHeader ? 'Present' : 'Missing'}`);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.log('JWT Middleware - No valid Bearer token found');
      return next();
    }

    const token = authHeader.substring(7);
    try {
      const secret = this.configService.get('JWT_SECRET');
      const payload = jwt.verify(token, secret) as unknown as JwtPayload;
      (req as any).user = { userId: payload.sub, email: payload.email, rol: payload.rol };
      this.logger.log(`JWT Middleware - Token decoded successfully for user: ${payload.email}, rol: ${payload.rol}`);
    } catch (error) {
      this.logger.error(`JWT Middleware - Token verification failed: ${error.message}`);
      // Si el token es inválido, simplemente continuamos sin usuario
      // Los guards de tRPC manejarán la autorización
    }
    next();
  }
}
