import { Module } from '@nestjs/common';
import { AppService } from '../app.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AppService, AuthService],
})
export class AuthModule {}
