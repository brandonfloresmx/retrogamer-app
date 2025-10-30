const express = require('express');
const mysql = require('mysql');
const myConnection= require('express-myconnection');
const app = express();

app.use(myConnection(mysql,{
  host: 'localhost',
  user: 'retrogamer',
  password: 'retro',
  port: 3306,
  database: 'db_retrogamer'
}))

app.get('/', (req, res) => res.send('Retro Gamer'));
app.listen(8080);