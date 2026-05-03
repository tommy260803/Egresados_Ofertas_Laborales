import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TrpcRouter } from './trpc/trpc.router';
import { JwtMiddleware } from './common/middlewares/jwt.middleware';
import * as express from 'express';
import { join } from 'path';
import { resolve } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Servir archivos estáticos (antes del global prefix)
  const uploadsPath = resolve(process.cwd(), 'uploads');
  Logger.log(`Serving static files from: ${uploadsPath}`);
  Logger.log(`Current working directory: ${process.cwd()}`);
  app.use('/uploads', express.static(uploadsPath));

  app.enableCors({ origin: configService.get('FRONTEND_URL'), credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // JWT middleware para tRPC
  const jwtMiddleware = app.get(JwtMiddleware);
  app.use('/trpc', (req, res, next) => jwtMiddleware.use(req, res, next));

  // tRPC handler
  const trpcRouter = app.get(TrpcRouter);
  app.use('/trpc', trpcRouter.handlers);
  
  const port = configService.get('PORT') || 4000;
  await app.listen(port);
  Logger.log(`Backend running on http://localhost:${port}`);
  Logger.log(`tRPC available on /trpc`);
}
bootstrap();