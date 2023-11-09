import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ApiModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
