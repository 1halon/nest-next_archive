import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, NotFoundExceptionFilter } from './app.module';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WsAdapter } from '@nestjs/platform-ws'
import { readFileSync } from 'fs';

NestFactory.create<NestExpressApplication>(AppModule).then(function (app) {
  app.getHttpAdapter().useStaticAssets(join(process.cwd(), 'client/public'), { prefix: '/assets/' });
  app.disable('x-powered-by');
  app.enableCors({
    allowedHeaders: 'Accept,Authorization,Content-Type',
    credentials: true,
    methods: 'DELETE,GET,POST,PUT,OPTIONS,UPDATE',
    origin: true
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  //app.use(helmet());
  //app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useWebSocketAdapter(new WsAdapter(app));
  app.listen(80);
});