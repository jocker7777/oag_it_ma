export const checkUser = (data) => {
  return new Promise(async (resolve, reject) => {
    const data = await globalDB
      .query(`select id from user where username = ? and email = ?`, [
        data.username,
        data.email,
      ])
      .catch((e) => {
        console.error(e);
        reject({ type: "ERROR", message: "INTERNAL SERVER ERROR" });
      });
    data[0]?.id ? resolve(data[0].id) : resolve(false);
  });
};

export const updatePassword = (id, password) => {
  return new Promise(async (resolve, reject) => {
    const data = await globalDB
      .query(`update user set password = ? where id = ?`, [password, id])
      .catch((e) => {
        console.error(e);
        reject({ type: "ERROR", message: "INTERNAL SERVER ERROR" });
      });
    resolve(data);
  });
};
