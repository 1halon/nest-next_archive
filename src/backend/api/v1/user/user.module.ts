import { Module } from '@nestjs/common';
import UserService from './user.service';
import { RedisModule } from 'src/backend/redis.module';

@Module({
  exports: [UserService],
  imports: [RedisModule],
  providers: [UserService],
})
export default class UserModule {}
