import { ConnectedSocket, OnConnect, SocketController } from 'socket-controllers';

import { log } from '../logger';
import { Service } from 'typedi';
import { ExtSocket } from '../types/socket.type';

@Service()
@SocketController()
export class MainController {
  @OnConnect()
  public onConnection(@ConnectedSocket() socket: ExtSocket) {
    log.info(`New Socket connected: ${socket.id}`);
  }
} 