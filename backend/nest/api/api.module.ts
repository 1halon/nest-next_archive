import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'backend/nest/auth/jwt.strategy';
import { S3Service } from 'backend/nest/s3/s3.service';
import { TemplateService } from 'backend/nest/template/template.service';
import { UserModule } from 'backend/nest/user/user.module';
import { ApiControllerV1 } from './v1/api.controller';
import { ApiServiceV1 } from './v1/api.service';
import { AuthControllerV1 } from './v1/auth.controller';
import { AuthServiceV1 } from './v1/auth.service';

@Module({
    imports: [UserModule],
    providers: [ApiServiceV1, AuthServiceV1, JwtStrategy, S3Service, TemplateService],
    exports: [ApiServiceV1, AuthServiceV1],
    controllers: [ApiControllerV1, AuthControllerV1]
})
export class ApiModule {
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
