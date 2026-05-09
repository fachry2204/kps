import mysql from 'mysql2/promise';

const pool = (globalThis as any).pool || mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password is empty
  database: 'kpsdata',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).pool = pool;
}

export default pool;
