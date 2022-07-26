import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookie_parser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import requestIP from 'request-ip';
import useragent from 'express-useragent';
import { WsAdapter } from '@nestjs/platform-ws';
import { GetMode } from 'src/shared';

const port = GetMode(process.env).port;

NestFactory.create<NestExpressApplication>(AppModule, {
  abortOnError: false,
  cors: {
    allowedHeaders: 'Accept,Authorization,Content-Type',
    credentials: true,
    methods: 'DELETE,GET,POST,PUT,OPTIONS',
    origin: true,
  },
  httpsOptions:
    port === 443
      ? {
          cert: readFileSync(join(__dirname, './', 'localhost.crt')),
          key: readFileSync(join(__dirname, './', 'localhost.key')),
        }
      : null,
})
  .then(function (app) {
    app.use(cookie_parser(process.env['COOKIE_SECRET']));
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-eval'"],
            'style-src-elem': [
              "'self'",
              "'unsafe-inline'",
              'https://fonts.googleapis.com',
            ],
          },
        },
        dnsPrefetchControl: { allow: true },
      }),
    );
    app.use(requestIP.mw());
    app.use(useragent.express());
    app.useWebSocketAdapter(new WsAdapter(app));
    app.listen(port, () =>
      Logger.verbose(`Listening on port ${port}`, 'NestApplication'),
    );
  })
  .catch((error) => Logger.error(error, 'NestApplication'));
