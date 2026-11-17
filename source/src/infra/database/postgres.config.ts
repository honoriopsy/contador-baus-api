import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// DATABASE_URL (endereço completo, ex.: Neon) tem prioridade; sem ele, usa os campos DB_* como antes.
// Banco gerenciado (Neon) exige SSL; DB_SSL=false desliga para um Postgres local.
const databaseUrl = process.env.DATABASE_URL;
const useSsl = process.env.DB_SSL ? process.env.DB_SSL !== 'false' : Boolean(databaseUrl);

// Alterado de dbPool para pool para bater com o auth.repository.ts
export const pool = new Pool({
  ...(databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'fnbr_community',
      }),
  ...(useSsl ? { ssl: { rejectUnauthorized: true } } : {}),
  max: 10,
  idleTimeoutMillis: 60000,
  // Neon desliga o banco parado; acordar leva alguns segundos.
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || (databaseUrl ? '15000' : '2000'), 10),
});

export async function testDatabaseConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('[Database] Conexão com PostgreSQL estabelecida através do Pool.');
    client.release(); 
  } catch (error) {
    console.error('[Database] Falha ao conectar com o PostgreSQL:', error);
    process.exit(1); 
  }
}