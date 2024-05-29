import { Module } from '@nestjs/common';
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

@Module({
  controllers: [AppController],
  imports: [
    //ConfigModule.forRoot({ envFilePath: 'src/backend/.env' }),
    ApiModule,
    MongooseModule.forRoot(process.env['MONGODB'], { dbName: 'nest-next' }),
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
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
