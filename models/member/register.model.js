export const insertUser = (email) => {
  return new Promise(async (resolve, reject) => {
    const data = await globalDB
      .query(`INSERT INTO user ( email,  password) VALUES ( ?, ? )`, [
        email,
        password,
      ])
      .catch((e) => {
        if (e.code == "ER_DUP_ENTRY")
          return reject({
            type: "DUP",
            message: `${e.sqlMessage
              .split(" ")[5]
              .replaceAll("'", "")} ALREADY TAKEN`,
          });
        console.error(e);
        reject({ type: "ERROR", message: "INTERNAL SERVER ERROR" });
      });
    resolve(data);
  });
};
