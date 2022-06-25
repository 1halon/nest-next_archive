import { Module } from '@nestjs/common';
import { AppService } from '../app.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  providers: [AppService, AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
