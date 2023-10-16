module.exports.findUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    console.log(data.username);
    const dbdata = await globalDB
      .promise()
      .query(`select * from oag_user where Username = ?`, [data.username])
      .catch((e) => {
        console.error(e);
        reject({ code: 500 });
      });
    resolve(dbdata);
  });
};
