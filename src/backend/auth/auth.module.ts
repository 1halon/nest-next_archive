import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
  imports: [
    JwtModule.register({
      secret: process.env['JWT_SECRET'],
    }),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
