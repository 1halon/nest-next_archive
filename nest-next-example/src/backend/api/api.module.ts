import { Module } from '@nestjs/common';
import { ApiModuleV1 } from './v1/v1.module';
import { ApiService } from './api.service';

@Module({
  imports: [ApiModuleV1],
  exports: [ApiService],
  providers: [ApiService],
})
export class ApiModule {}
