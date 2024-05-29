import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookie_parser from 'cookie-parser';
import helmet from 'helmet';

NestFactory.create<NestExpressApplication>(AppModule).then((app) => {
  app.enableCors({
    allowedHeaders: 'Accept,Authorization,Content-Type',
    credentials: true,
    methods: 'DELETE,GET,POST,PUT,OPTIONS,UPDATE',
    origin: true,
  });
  app.use(cookie_parser(process.env.COOKIE_SECRET));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': "'self'",
          'style-src-elem': ["'self'", 'https://fonts.googleapis.com'],
        },
      },
      dnsPrefetchControl: { allow: true },
    }),
  );
  app.listen(80);
});
