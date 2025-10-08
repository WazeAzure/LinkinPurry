// src/config/database.ts
import { DataSource } from 'typeorm';
import * as entities from '../entities';
import { config } from './environment.js';
import pg from 'pg';
import { duration } from 'happy-dom/lib/PropertySymbol.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.DATABASE_URL,
  entities: Object.values(entities),
  synchronize: false, // since the schema already exist
  logging: config.NODE_ENV === "development",
  driver: pg,
  cache: {
    duration: 1000, // 1 second
    type: "redis",
    options: {
        url: config.REDIS_URL,
    }
  }
});