const yup = require("yup");
const authen = require("../public/authen-middleware");

const logIn = async (req, res) => {
  try {
    //--Validate body data--
    const userSchema = yup.object({
      //--- Schema validation setting ---
      username: yup.string().required(),
      password: yup.string().required(),
    });
    const loginData = await userSchema.validate(req.body).catch((e) => {
      //--- Validate if input match schema ---
      throw { code: 400 };
    });
    //-- End Validate body data--
    //-- find user in db and check password --
    const [dataRows] = await findUserData(loginData).catch((e) => {
      throw e;
    });

    if (!dataRows[0]?.UserID || dataRows[0]?.ActiveStatus !== 0)
      throw { code: 403 };
    delete dataRows[0].password;
    delete dataRows[0].ResetPasswordStatus;
    delete dataRows[0].ActiveStatus;
    let passwordMatch = await passwordCheck(
      dataRows[0].FirstNameEng,
      dataRows[0].PersonID,
      dataRows[0].Username,
      loginData.password
    ).catch((e) => {
      return false;
    });
    if (!passwordMatch) throw { code: 401 };
    //-- End find user r in db and check password --

    //-- sign token --
    const token = await authen.signToken(dataRows[0]);
    //-- end sign token --
    res.json({ accessToken: token });
  } catch (e) {
    //-- if any error occur return server error status --
    if (!e.code) {
      res.status(500).end();
    }
    res.status(e.code).end();
    //-- End error handler --
  }
};

//-- Query user data from db --
const findUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    const dbdata = await globalDB
      .promise()
      .query(`select * from oag_user where ActiveStatus = 0 and Username = ?`, [
        data.username,
      ])
      .catch((e) => {
        console.error(e);
        reject({ code: 500 });
      });
    resolve(dbdata);
  });
};
//-- End query user data --
 const logOut = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204) //No content
  res.clearCookie('jwt',
    {
      httpOnly: true,
      // sameSite: 'None',
      // secure: true
    })
  res.json({ message: 'Cookie cleared' })
};
//-- Check password --
const passwordCheck = (firstNameEng, personalId, username, password) => {
  return new Promise((resolve, reject) => {
    try {
      //-- check db if password pattern match equation --
      if ((!username && !firstNameEng) || !personalId) resolve(false);
      let dbPassword = firstNameEng
        ? firstNameEng.substring(0, 3)
        : username.substring(0, 3);
      //-- End check password pattern equation check --
      //-- check if password match --
      dbPassword += `${personalId.substring(personalId.length - 3)}`;
      if (password != dbPassword) resolve(false);
      resolve(true);
      //-- End check password --
    } catch (e) {
      //-- if any error occur log and return server error status --
      reject({ code: 500 });
      //-- End error handler --
    }
  });
};
//-- End password check --

module.exports = { logIn,logOut };

