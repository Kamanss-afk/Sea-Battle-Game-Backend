import pino from 'pino';

const date: string = new Date().toLocaleString();

export const log = pino({
  prettyPrint: true,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${date}"`,
});