const mysql = require('mysql2');
const dbConfig = require('../configs/db.config');

let connection = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    port:dbConfig.DB_PORT,
    // timezone: 'UTC',
    // waitForConnections: true,
})

// console.log("user", dbConfig)
module.exports = connection;
