import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, WebSocket } from 'ws';

const clients = {} as Record<string, WebSocket>;

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    private readonly server: Server;

    afterInit(server: Server) {

    }

    handleConnection(client: WebSocket, ...args: any[]) {
        const id = randomUUID(); clients[id] = client;
        client.send(JSON.stringify({ type: 'ID', id }));
        client.onmessage = async (event) => {
            const data = await new Promise((resolve) => resolve(JSON.parse(event.data.toString()))).catch(() => event.data.toString()) as any;
        }
    }

    handleDisconnect(client: any) {

    }
}
