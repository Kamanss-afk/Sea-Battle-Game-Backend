import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import http from 'http';
import socketServer from './socket';

import { env } from './utils/env.utils';
import { log } from './logger';

const port: number = env.get('PORT').default(5432).asPortNumber();
const host: string = env.get('HOST').default('localhost').asString();

app.set('port', port);
app.set('host', host);

const server = http.createServer(app);

server.listen(port, host);
server.on('error', error => log.error(error));
server.on('listening', () => log.info(`Server Running on Port: ${port}`));

socketServer(server);