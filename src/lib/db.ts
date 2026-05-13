import mysql from 'mysql2/promise';

const pool = (globalThis as any).pool || mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'kpsdata',
  password: process.env.DB_PASSWORD || 'Bangbens220488!',
  database: process.env.DB_NAME || 'kpsdata',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).pool = pool;
}

export default pool;
