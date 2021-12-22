import { ArgumentsHost, Catch, ExceptionFilter, HttpException, MiddlewareConsumer, Module, NestModule, NotFoundException, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/app.service';
import { AppMiddleware } from './app.middleware';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://root:rStAlyBZsgn80aLx@cluster0.ivz8y.mongodb.net/Cluster0?retryWrites=true&w=majority'),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    })
  ],
  controllers: [AppController, ApiController],
  providers: [AppService, ApiService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes({
      path: '/*',
      method: RequestMethod.ALL
    })
  }
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.sendFile(join(process.cwd(), 'client/public/index.html'));
  }
}