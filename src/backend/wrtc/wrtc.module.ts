import { Module } from '@nestjs/common';
import { WrtcService } from './wrtc.service';
import { WrtcGateway } from './wrtc.gateway';

@Module({
  providers: [WrtcService, WrtcGateway],
})
export class WrtcModule {}
