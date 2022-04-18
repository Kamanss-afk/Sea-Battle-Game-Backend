import { v4 as uuidv4 } from 'uuid';
import { Ship } from './ship.model';

export class Player {
  id: string;
  name: string;
  ready: boolean;
  ships: Array<Ship>;

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
    this.ships = [];
    this.ready = false;
  }
}