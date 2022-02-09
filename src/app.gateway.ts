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
        client.send(JSON.stringify({ event: 'ID', id }));
        client.onmessage = async (event) => {
            const data = await new Promise((resolve) => resolve(JSON.parse(event.data.toString()))).catch(() => event.data.toString()) as any;

            if (data.event === 'CALL') {
                clients[data.to]?.send(JSON.stringify({
                    event: 'CALL',
                    offer: data.offer,
                    from: data._id
                }));
            } else if (data.event === 'ANSWER') {
                clients[data.to]?.send(JSON.stringify({
                    event: 'ANSWER',
                    answer: data.answer,
                    from: data._id
                }));
            } else if (data.event === 'ICECANDIDATE') {
                clients[data.to]?.send(JSON.stringify({
                    event: 'ICECANDIDATE',
                    candidate: data.candidate,
                    from: data._id
                }));
            }
        }
    }

    handleDisconnect(client: any) {

    }
}
