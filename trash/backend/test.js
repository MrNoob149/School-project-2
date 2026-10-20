import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'Mrnoob',
  password: '123456789',
  database: 'mainproject',
});