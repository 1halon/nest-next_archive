import { Module } from '@nestjs/common';
import { ApiControllerV1 } from './v1/api.controller';
import { ApiServiceV1 } from './v1/api.service';

@Module({
    imports: [],
    providers: [ApiServiceV1],
    exports: [ApiServiceV1],
    controllers: [ApiControllerV1]
})
export class ApiModule {}
