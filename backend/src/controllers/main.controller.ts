import { ConnectedSocket, OnConnect, OnDisconnect, SocketController, SocketIO } from 'socket-controllers';
import { Server } from 'socket.io';

import { log } from '../logger';
import { Service } from 'typedi';
import { ExtSocket } from '../types/socket.type';
import { gamesService } from '../services/games.service';
import { GameState } from '../models/game.model';

@Service()
@SocketController()
export class MainController {
  constructor(private gamesServices: gamesService) {}

  @OnConnect()
  public onConnection(@ConnectedSocket() socket: ExtSocket) {
    log.info(`New Socket connected: ${socket.id}`);
  }

  @OnDisconnect()
  public onDisconnect(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: ExtSocket
  ) {
    log.info(`Socket was diconnected: ${socket.id}`);

    const gameId = socket.gameId;
    if(!gameId) return;

    this.gamesServices.destroyGame(gameId);

    io.to(gameId).emit('game-state', {
      state: GameState.END,
    });
  }
} 