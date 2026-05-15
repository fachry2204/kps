import mysql from 'mysql2/promise';

const pool = (globalThis as any).pool || mysql.createPool({
  host: process.env.DB_HOST || 'kps.garudaserver.cloud',
  user: process.env.DB_USER || 'kpsdata',
  password: process.env.DB_PASSWORD || 'Bangbens220488!',
  database: process.env.DB_NAME || 'kpsdata',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on('error', (err: any) => {
  console.error('Unexpected Database Pool Error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log('Database connection lost. Re-establishing...');
  }
});

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).pool = pool;
}

export default pool;
