import mysql from 'mysql';

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '188671',
  database: 'ece9065',
});

export default db;