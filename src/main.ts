import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule, NotFoundExceptionFilter } from './app.module';
import helmet from 'helmet'

NestFactory.create<NestExpressApplication>(AppModule).then(function (app) {
  app.getHttpAdapter().useStaticAssets(join(process.cwd(), 'client/public'), { prefix: '/assets' });
  app.disable('x-powered-by');
  app.enableCors({
    allowedHeaders: 'Accept,Authorization,Content-Type',
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    origin: true
  });
  app.use(helmet());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.listen(80);
});