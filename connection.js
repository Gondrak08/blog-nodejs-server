const mysql = require("mysql");
const dbConfig = {
  host: "localhost",
  user: "vitor",
  password: "212223",
  database: "texteditor_db",
};

const dbConnection = mysql.createConnection(dbConfig);
module.exports = dbConnection;
