import { DynamicModule, MiddlewareConsumer, Module, NestMiddleware, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { S3Service } from '../s3/s3.service';
import { TemplateService } from '../template/template.service';
import { UserModule } from '../user/user.module';
import { ApiControllerV1 } from './v1/api.controller';
import { ApiServiceV1 } from './v1/api.service';
import { AuthControllerV1 } from './v1/auth.controller';
import { AuthServiceV1 } from './v1/auth.service';
import limiter from 'express-rate-limit';

@Module({
    imports: [UserModule],
    providers: [ApiServiceV1, AuthServiceV1, JwtStrategy, S3Service, TemplateService],
    exports: [ApiServiceV1, AuthServiceV1],
    controllers: [ApiControllerV1, AuthControllerV1]
})
export class ApiModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(class implements NestMiddleware {
            use(req: any, res: any, next: (error?: any) => void) { limiter({ max: 25 }); next(); }
        }).forRoutes({
            method: RequestMethod.ALL,
            path: '/api/*'
        })
    }
    static forRoot(): DynamicModule {
        return {
            imports: [
                JwtModule.register({
                    secret: process.env.JWT_SECRET,
                    //signOptions: { expiresIn: '16h' },
                    verifyOptions: { ignoreExpiration: false }
                }),
            ],
            module: ApiModule
        }
    }
}
