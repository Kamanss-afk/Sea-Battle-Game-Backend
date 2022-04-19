import { Socket } from 'socket.io';

export interface ExtSocket extends Socket {
  gameId?: string;
  userId?: string;
}