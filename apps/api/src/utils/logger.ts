import pino from 'pino';
import { appConfig } from '../config.js';

export const logger = pino({
  level: appConfig.logLevel,
  transport: appConfig.logPretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export type Logger = typeof logger;
