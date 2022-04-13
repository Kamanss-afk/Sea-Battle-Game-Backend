import { Socket } from 'socket.io';
import { ConnectedSocket, OnConnect, SocketController } from 'socket-controllers';

import { log } from '../logger';
import { Service } from 'typedi';

@Service()
@SocketController()
export class MainController {
  @OnConnect()
  public onConnection(@ConnectedSocket() socket: Socket) {
    log.info(`New Socket connected: ${socket.id}`);
  }
}