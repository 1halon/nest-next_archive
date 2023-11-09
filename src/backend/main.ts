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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

NestFactory.create<NestExpressApplication>(AppModule, {
  abortOnError: true,
  cors: {
    allowedHeaders: 'Accept,Authorization,Content-Type',
    credentials: true,
    methods: 'DELETE,GET,POST,PUT,OPTIONS',
    origin: true,
  },
  /*httpsOptions: {
    cert: readFileSync(join(process.cwd(), 'src', 'backend', 'localhost.crt')),
    key: readFileSync(join(process.cwd(), 'src', 'backend', 'localhost.key')),
  },*/
})
  .then(function (app) {
    const port: number = JSON.parse(
      process.env[process.env['NODE_ENV'].toUpperCase()],
    ).port;
    SwaggerModule.setup(
      'swagger',
      app,
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder().setTitle('Meet').build(),
      ),
    );
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
