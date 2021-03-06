import { Service } from 'typedi';

import { Game } from '../models/game.model';

interface Games {
  [key: string]: Game | null;
}

@Service()
export class gamesService {
  games: Games = {};

  public crateGame() {
    const game = new Game();
    this.games[game.id] = game;
    return game;
  }

  public findGame(gameId: string) {
    return this.games[gameId];
  }

  public destroyGame(gameId: string) {
    this.games[gameId]?.timer.stop();
    this.games[gameId] = null;
  }
} 