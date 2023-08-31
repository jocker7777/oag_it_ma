export const getLoginInfo = (username) => {
  return new Promise(async (resolve, reject) => {
    const data = await globalDB
      .query(`select * from User where username = ?`, [username])
      .catch((e) => {
        console.error(e);
        reject({ type: "ERROR", message: "INTERNAL SERVER ERROR" });
      });
    resolve(data);
  });
};
