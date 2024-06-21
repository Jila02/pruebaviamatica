// src/db.js
import pg from 'pg';
import { DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT, DB_USER } from './config.js';

// Añadir logs de depuración

export const pool = new pg.Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_DATABASE,
  user: DB_USER,
  password: DB_PASSWORD
});
