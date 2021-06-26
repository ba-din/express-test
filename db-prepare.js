import mysql from 'mysql2';
import dotenv from 'dotenv';
import dbConfig from './app/db/config.js';
import fs from 'fs';
import { exit } from 'process';

dotenv.config()

var connection = mysql.createConnection({
  host     : dbConfig.HOST,
  user     : dbConfig.USER,
  password : dbConfig.PASSWORD,
  database : dbConfig.DB
});

connection.connect();
console.log('DB conntected');

const dataSql = fs.readFileSync('./app/db/tables/token.sql').toString();

const dataArr = dataSql.toString().split(';');

dataArr.forEach((query) => {
  if(query) {
    // Add the delimiter back to each query before you run them
    // In my case the it was `);`
    query += ';';
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      console.log('The solution is: ', results);
    });
  }
});

connection.end();
