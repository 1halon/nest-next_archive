import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { collection: 'users', name: 'User', schema: UserSchema }
    ])
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
