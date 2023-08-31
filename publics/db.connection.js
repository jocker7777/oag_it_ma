import * as mysql from "mysql2";

const connect_db = () => {
  return new Promise((resolve, reject) => {
    try {
      var pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.MYSQL_URL,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        timezone: process.env.MYSQ_TIMEZONE,
      });
      resolve(pool.promise());
    } catch (err) {
      reject(err);
    }
  });
};

export default connect_db;
