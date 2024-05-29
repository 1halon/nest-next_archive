import { Module } from '@nestjs/common';
import { createClient } from 'redis';

@Module({
  exports: ['REDIS_CLIENT'],
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      useValue: {
        url: 'redis://192.168.1.16:6379',
      },
    },
    {
      inject: ['REDIS_OPTIONS'],
      provide: 'REDIS_CLIENT',
      useFactory: async (options: { url: string }) => {
        const client = createClient(options);
        await client.connect();
        return client;
      },
    },
  ],
})
export class RedisModule {}
