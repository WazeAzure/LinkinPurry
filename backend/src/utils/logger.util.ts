import pino from 'pino';
import { config } from '../config/environment';

export const logger = pino({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});