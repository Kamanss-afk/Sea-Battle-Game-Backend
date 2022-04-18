export interface ShipCoords {
  x: number;
  y: number;
}

export class Ship {
  coords: Array<ShipCoords>;
  destroyed: boolean;
  shootedCells: Array<ShipCoords>;

  constructor(coords: Array<ShipCoords>) {
    this.coords = coords;
    this.shootedCells = [];
    this.destroyed = false;
  }
}