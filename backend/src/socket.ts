import http from 'http';
import Container from 'typedi';
import { Server } from 'socket.io';
import { useContainer, useSocketServer } from 'socket-controllers';

export default (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  useContainer(Container);

  useSocketServer(io, {
    controllers: [ __dirname + '/controllers/*.js']
  });

  return io;
};