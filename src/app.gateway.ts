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
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, WebSocket } from 'ws';

const offers = {};

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    private readonly server: Server;

    afterInit(server: Server) {

    }

    handleConnection(client: WebSocket, ...args: any[]) {
        client.onmessage = async (event) => {
            const data = await new Promise((resolve) => resolve(JSON.parse(event.data.toString()))).catch(() => event.data.toString()) as any;
            
            if (data.type === 'call') {
                offers[data.id] = {
                    offer: data.offer,
                    client: client
                };
            }
            if (data.type === 'answer') {
                client.send(JSON.stringify({
                    type: 'call',
                    offer: offers[data.id].offer
                }));
            }
            if (data.type === 'answer2') {
                offers[data.id].client.send(JSON.stringify({
                    type: 'answer',
                    answer: data.answer
                }));
            }
        }
    }

    handleDisconnect(client: any) {

    }
}
