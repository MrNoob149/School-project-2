import mysql from 'mysql2';
import 'dotenv/config';

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD loaded:', Boolean(process.env.DB_PASSWORD));
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// promise pool is asynchronous version of the pool and
// returns promises, which is used with async/await syntax
const promisePool = pool.promise();
export default promisePool;