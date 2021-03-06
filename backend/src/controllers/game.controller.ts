import { Service } from 'typedi';
import { Server } from 'socket.io';
import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from 'socket-controllers';

import { gamesService } from '../services/games.service';
import { GameState } from '../models/game.model';
import { ShipCoords } from '../models/ship.model';
import { ExtSocket } from '../types/socket.type';

@Service()
@SocketController()
export class GameController {
  constructor(private gamesService: gamesService) {}

  @OnMessage('game-start')
  public async startGame(
    @ConnectedSocket() socket: ExtSocket,
    @MessageBody() message: { name: string }
  ) {
    try {
      const { name } = message;

      const game = this.gamesService.crateGame();
      if(!game) throw new Error('ERROR_START_GAME');

      const player = game.joinGame(name);
      if(!player) throw new Error('ERROR_JOIN_PLAYER');
  
      await socket.join(game.id);

      socket.gameId = game.id;
      socket.userId = player.id;

      socket.emit('game-start_success', { 
        gameId: game.id, 
        player: {
          id: player.id,
          name: player.name,
        }
      });

    } catch(error) {
      socket.emit('game-start_error', { 
        message: error.message,
      });
    }
  }

  @OnMessage('game-join')
  public async joinGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: ExtSocket,
    @MessageBody() message: { name: string, gameId: string }
  ) {
    try {
      const { gameId, name } = message;
      
      const game = this.gamesService.findGame(gameId);
      if(!game) throw new Error('ERROR_GAME_NOT_FOUND');

      const player = game.joinGame(name);
      if(!player) throw new Error('ERROR_JOIN_PLAYER');

      await socket.join(gameId);

      socket.gameId = game.id;
      socket.userId = player.id;

      socket.emit('game-join_success', {
        gameId: game.id,
        player: {
          id: player.id,
          name: player.name,
        }
      });

      if(game.state === GameState.DEPLOY) {
        io.to(gameId).emit('game-state', { 
          state: game.state,
        });
      }

    } catch(error) {
      socket.emit('game-join_error', {
        message: error.message
      });
    }
  }

  @OnMessage('deploy-ships')
  public async deployShips(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: ExtSocket,
    @MessageBody() message: { userId: string, gameId: string, ships: Array<Array<ShipCoords>> }
  ) {
    try {

      const { ships } = message;
      const { userId, gameId } = socket;
      
      const game = this.gamesService.findGame(gameId);
      if(!game) throw new Error('ERROR_GAME_NOT_FOUND');

      const player = game.players.find(player => player.id === userId);
      if(!player) throw new Error('ERROR_USER_NOT_FOUND');

      if(game.state === GameState.INIT) throw new Error('ERROR_GAME_STATE_INIT');

      const resutl = game.deployShips(userId, ships);

      if(!resutl) throw new Error('ERROR_DEPLOY_SHIPS');

      if(player.ready) {
        socket.broadcast.to(gameId).emit('opponent-ready', {
          opponent: {
            id: player.id,
            name: player.name,
          }
        });
      }

      socket.emit('deploy-ships_success', {
        ready: player.ready,
      });

      if(game.state === GameState.WAIT) {
        socket.emit('game-state', { 
          state: game.state,
        });
      }

      if(game.state === GameState.BATTLE) {

        io.to(gameId).emit('game-state', { 
          state: game.state,
        })

        game.timer.start((duration, done) => {
          if(done) {
            game.changeTurn();

            io.to(gameId).emit('change-turn', { 
              turn: game.players[game.turn].id,
            });
          }
  
          io.to(gameId).emit('timer-countdown', {
            duration, 
            done,
          });
        });

      }
    } catch(error) {
      socket.emit('deploy-ships_error', {
        message: error.message,
      });
    }
  }

  @OnMessage('make-shot')
  public async makeShot(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: ExtSocket,
    @MessageBody() message: { userId: string, gameId: string, coords: ShipCoords }
  ) {
    try {
      const { coords } = message;
      const { userId, gameId } = socket;

      const game = this.gamesService.findGame(gameId);
      if(!game) throw new Error('ERROR_GAME_NOT_FOUND');

      const { hit, destroyed } = game.makeShot(userId, coords);

      io.to(gameId).emit('change-turn', { 
        turn: game.players[game.turn].id, 
      });

      io.to(gameId).emit('timer-countdown', { 
        duration: game.timer.duration,
        done: game.timer.done,
      });
  
      socket.emit('make-shot_success', {
        coords,
        hit,
        destroyed,
      });
  
      socket.broadcast.to(gameId).emit('get-shot', {
        coords,
        hit,
        destroyed,
      });
  
      if(game.state === GameState.END) {
        io.to(gameId).emit('game-state', { 
          state: GameState.END,
          winner: {
            id: game.winner?.id,
            name: game.winner?.name,
          }
        });
      }
    } catch(error) {
      socket.emit('make-shot_error', {
        message: error.message,
      });
    }
  }
}