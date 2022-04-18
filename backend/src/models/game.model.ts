import { v4 as uuidv4 } from 'uuid';
import { Player } from './player.model';
import { Ship, ShipCoords } from './ship.model';
import { Timer } from './timer.model';

export enum GameState {
  INIT='INIT',
  DEPLOY='DEPLOY',
  BATTLE='BATTLE',
  END='END',
}

export class Game {
  id: string;
  players: Array<Player>;
  timer: Timer;
  state: GameState;
  turn: number;
  winner: Player | undefined;
  looser: Player | undefined;

  constructor() {
    this.id = uuidv4();
    this.players = [];
    this.state = GameState.INIT;
    this.timer = new Timer();
    this.turn = 0;
    this.winner = undefined;
    this.looser = undefined;
  }

  public joinGame(name: string): Player {
    if(this.players.length > 2) throw new Error('ERROR_NO_SEATS');

    const player = new Player(name);
    this.players.push(player);

    if(this.players.length === 2) {
      this.state = GameState.DEPLOY;
    }

    return player;
  }

  public deployShips(userId: string, shipsCoords: Array<Array<ShipCoords>>): boolean {
    if(shipsCoords.length < 10) throw new Error('ERROR_INCORRECT_COORDS');

    const player = this.players.find(player => player.id === userId);
    if(!player) throw new Error('ERROR_PLAYER_NOT_EXIST');

    shipsCoords.map((coord) => player.ships.push(new Ship(coord)));

    if(player.ready) throw new Error('ERROR_PLAYER_ALREADY');

    player.ready = true;

    if(this.players.filter(player => player.ready).length === 2) {
      this.state = GameState.BATTLE;
    }

    return true;
  }

  public makeShot(userId: string, coords: ShipCoords) {
    const player = this.players.find(player => player.id == userId);
    if(!player) throw new Error('ERROR_PLAYER_NOT_EXIST');

    const opponent = this.players.find(opponent => opponent.id != userId);
    if(!opponent) throw new Error('ERROR_OPPONENT_NOT_EXIST');

    if(this.players[this.turn].id != userId) throw new Error('ERROR_TURN');

    const shotedShip = opponent.ships.filter(ship => {
      return ship.coords.find(shipCoords => JSON.stringify(shipCoords) === JSON.stringify(coords));
    })[0];

    let destroyed: boolean = false;
  
    if(shotedShip) {
      shotedShip.shootedCells.push(coords);

      if(shotedShip.shootedCells.length === shotedShip.coords.length) shotedShip.destroyed = true;
    
      destroyed = shotedShip.destroyed;
    }

    if(!shotedShip) {
      this.changeTurn();
    }

    this.timer.reset();

    if(opponent.ships.every(ship => ship.destroyed)) {
      this.timer.stop();
      this.state = GameState.END;
      this.winner = player;
      this.looser = opponent;
    }

    return { hit: !!shotedShip, destroyed };

  }

  public changeTurn(): void {
    this.turn = this.turn === 0 ? 1 : 0;
  }

}