import { Injectable } from '@nestjs/common';
import { Client } from 'shared/ts/client';

@Injectable()
export class WrtcService {
    public static Client = Client;
    public clients = {} as Record<string, Client>;
}
