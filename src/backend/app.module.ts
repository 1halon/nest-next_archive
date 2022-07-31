import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { RenderModule } from 'nest-next';
import { AuthModule } from './auth/auth.module';
import Next from 'next';
import { MongooseModule } from '@nestjs/mongoose';
import { AppMiddleware } from './app.middleware';

@Module({
  controllers: [AppController],
  imports: [
    //ConfigModule.forRoot({ envFilePath: 'src/backend/.env' }),
    ApiModule,
    AuthModule,
    MongooseModule.forRoot(process.env['MONGODB'], { dbName: 'nest-next-example' }),
    /*RenderModule.forRootAsync(
      Next({ dev: process.env['NODE_ENV'] === 'development' }),
      { viewsDir: null },
    ),*/
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '.next'),
      serveRoot: '/_next',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend', 'public'),
      serveRoot: '/assets',
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes({
      method: RequestMethod.ALL,
      path: '/api/*',
    });
  }
}
