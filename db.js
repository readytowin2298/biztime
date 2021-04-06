/** Database setup for BizTime. */

const { Client } = require('pg');

const DB_URI = require('./secret.js');

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;