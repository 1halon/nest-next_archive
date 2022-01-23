import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { TemplateService } from 'src/template/template.service';
import { AuthControllerV1 } from './v1/auth.controller';
import { AuthServiceV1 } from './v1/auth.service';

@Module({
  imports: [
    UserModule,
  ],
  providers: [AuthServiceV1, TemplateService, JwtStrategy],
  exports: [AuthServiceV1],
  controllers: [AuthControllerV1]
})
export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
          verifyOptions: { ignoreExpiration: false }
        }),
      ],
      module: AuthModule
    }
  }
}