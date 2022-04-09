import { Injectable } from '@nestjs/common';
import { CommClient } from 'shared/ts/comm-client';

@Injectable()
export class WrtcService {
    public static Client = CommClient;
    public clients = {} as Record<string, CommClient>;
}
