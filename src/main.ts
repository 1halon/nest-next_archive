import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule, NotFoundExceptionFilter } from './app.module';
import * as compression from 'compression';
import * as csurf from 'csurf';

NestFactory.create<NestExpressApplication>(AppModule).then(function (app) {
  app.listen(80);
  app.getHttpAdapter().useStaticAssets(join(process.cwd(), 'client/public'), {
    prefix: '/assets/'
  });
  app.disable('x-powered-by');
  app.setViewEngine('html');
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.enableCors({
    allowedHeaders: 'Accept, Content-Type, X-Requested-With',
    credentials: true,
    methods: "GET,PUT,POST,DELETE,UPDATE,OPTIONS",
    origin: true
  });
  app.use(compression);
  app.use(csurf());
});