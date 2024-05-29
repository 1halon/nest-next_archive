import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RestController } from './rest.controller';
import { RestService } from './rest.service';

@Module({
  imports: [AuthModule],
  controllers: [RestController],
  providers: [RestService]
})
export class RestModule {}
