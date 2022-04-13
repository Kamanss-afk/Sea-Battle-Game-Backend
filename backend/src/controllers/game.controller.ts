import { SocketController } from 'socket-controllers';
import { Service } from 'typedi';

@Service()
@SocketController()
export class GameController {
  constructor() {}
}