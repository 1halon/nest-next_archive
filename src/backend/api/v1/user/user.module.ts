import { Module } from '@nestjs/common';
import UserService from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from './user.schema';
import { RedisModule } from 'src/backend/redis.module';

@Module({
  exports: [UserService],
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { collection: 'users', name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [UserService],
})
export default class UserModule {}
