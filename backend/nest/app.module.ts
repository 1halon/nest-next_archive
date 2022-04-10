import { ArgumentsHost, Catch, ExceptionFilter, HttpException, MiddlewareConsumer, Module, NestModule, NotFoundException, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppMiddleware } from './app.middleware';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { UserModule } from './user/user.module';
import { ApiModule } from './api/api.module';
import { WrtcModule } from './wrtc/wrtc.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApiModule.forRoot(),
    AuthModule,
    MailerModule.forRoot({
      defaults: {
        from: `"Meet" <${process.env.MAIL_ADDRESS}>`,
      },
      template: {
        dir: join(process.cwd(), 'client/private/templates/mail'),
        adapter: new EjsAdapter(),
        options: { strict: true, },
      },
      transport: {
        auth: { user: process.env.MAIL_ADDRESS, pass: process.env.MAIL_PASS },
        service: 'gmail'
      }
    }),
    MongooseModule.forRoot(process.env.MONGODB_LOCAL, { dbName: "meet" }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    UserModule,
    WrtcModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes({
      method: RequestMethod.ALL,
      path: '/*',
    })
  }
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(), response = ctx.getResponse(); response.statusCode = 404; response.send();
    //response.sendFile(join(process.cwd(), 'client/public/404.html'));
  }
}

