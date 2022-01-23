import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, NotFoundExceptionFilter } from './app.module';
import { join } from 'path';
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import * as requestIp from 'request-ip';

NestFactory.create<NestExpressApplication>(AppModule).then(function (app) {
  app.getHttpAdapter().useStaticAssets(join(process.cwd(), 'client/public'), { prefix: '/assets' });
  app.disable('x-powered-by');
  app.enableCors({
    allowedHeaders: 'Accept,Authorization,Content-Type',
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    origin: true
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(helmet());
  app.use(requestIp.mw());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.listen(80);
});