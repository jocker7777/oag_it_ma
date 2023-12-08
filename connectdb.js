const mysql = require('mysql2');

const db = mysql.createConnection({
    connectionLimit: 10,
    host: "172.16.10.151",
    port: 3306,
    user: "eticket",
    password: "p@ssw0rd",
    database: "eticket",
    insecureAuth: true,
  });
  
  db.connect((err) => {
    if (err) {
      throw err;
    }
    global.globalDB = db;
    console.log("Connected to MySQL");
  });

module.exports = db;