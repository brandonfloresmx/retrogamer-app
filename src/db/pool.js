const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',           
  port: 3307,                 
  user: 'retrogamer',
  password: 'retrogamer2025',
  database: 'retrogamer',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
