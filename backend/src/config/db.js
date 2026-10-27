import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connection established');
});

pool.on('error', (error) => {
  console.error('❌ Unexpected PostgreSQL pool error:', error);
});

export const query = (text, params) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

export const testDatabaseConnection = async () => {
  try {
    const result = await pool.query(
      'SELECT NOW() AS current_time'
    );

    console.log(
      `✅ PostgreSQL connected at ${result.rows[0].current_time}`
    );

    return true;
  } catch (error) {
    console.error(
      '❌ PostgreSQL connection failed:',
      error.message
    );

    return false;
  }
};

export default pool;