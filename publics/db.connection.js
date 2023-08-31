import * as mariadb from "mariadb";

const connect_db = () => {
  return new Promise((resolve, reject) => {
    const pool = mariadb.createPool({
      connectionLimit: 10,
      host: process.env.MARIADB_URL,
      port: process.env.MARIADB_PORT,
      user: process.env.MARIADB_USERNAME,
      password: process.env.MARIADB_PASSWORD,
      database: process.env.MARIADB_DATABASE,
    });

    pool
      .getConnection()
      .then((conn) => {
        resolve(conn);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default connect_db;
