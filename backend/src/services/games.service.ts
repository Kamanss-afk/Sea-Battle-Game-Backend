import { Service } from 'typedi';

import { Game } from '../models/game.model';

interface Games {
  [key: string]: Game;
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
} 