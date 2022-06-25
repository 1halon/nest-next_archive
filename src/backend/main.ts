import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, NotFoundExceptionFilter } from './app.module';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import limiter from 'express-rate-limit';
import requestIP from 'request-ip';
import userAgent from 'express-useragent';
import { WsAdapter } from '@nestjs/platform-ws';

NestFactory.create<NestExpressApplication>(AppModule).then(function (app) {
  app.enableCors({
    allowedHeaders: 'Accept,Authorization,Content-Type',
    credentials: true,
    methods: 'DELETE,GET,POST,PUT,OPTIONS,UPDATE',
    origin: true,
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': "'self'",
          'style-src-elem': ["'self'", 'https://fonts.googleapis.com'],
        },
      },
      dnsPrefetchControl: { allow: true },
    })
  );
  //app.use(limiter());
  app.use(requestIP.mw());
  app.use(userAgent.express());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useWebSocketAdapter(new WsAdapter(app));
  app.listen(80);
});
