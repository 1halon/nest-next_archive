import { Module } from '@nestjs/common';
import ApiController from './api.controller';
import ApiService from './api.service';
import AuthController from './auth/auth.controller';
import AuthService from './auth/auth.service';
import UserModule from './user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ApiController, AuthController],
  exports: [ApiService, AuthService],
  providers: [ApiService, AuthService, Function],
})
export class ApiModuleV1 {}
