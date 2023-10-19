const yup = require("yup");
const model = require("../models/auth");
const authen = require("../public/authen-middleware");

module.exports.logIn = async (req, res) => {
  try {
    // --Validate body data--
    let userSchema = yup.object({
      username: yup.string().required(),
      password: yup.string().required(),
    });
    let loginData = await userSchema.validate(req.body).catch((e) => {
      throw { code: 400 };
    });
    //-- End Validate body data--

    //-- find user in db and check password --
    const [dataRows] = await model.findUserData(loginData).catch((e) => {
      throw e;
    });
    if (!dataRows[0]?.UserID && dataRows[0]?.ActiveStatus !== 0)
      throw { code: 401 };
    delete dataRows[0].password;
    delete dataRows[0].ResetPasswordStatus;
    delete dataRows[0].ActiveStatus;
    let passwordMatch = await passwordCheck(
      dataRows[0].FirstNameEng,
      dataRows[0].PersonID,
      dataRows[0].Username,
      loginData.password
    );
    if (!passwordMatch) throw { code: 401 };
    //-- End find user r in db and check password --

    //-- sign token --//
    const token = await authen.signToken(dataRows[0]);
    //-- end sign token --
    res.json({ token: token });
  } catch (e) {
    if (!e.code) {
      return res.status(500).end();
    }
    res.status(e.code).end();
  }
};

const passwordCheck = (firstNameEng, personalId, username, password) => {
  return new Promise((resolve, reject) => {
    try {
      if (!firstNameEng || !personalId) resolve(false);
      let dbPassword = firstNameEng
        ? firstNameEng.substring(0, 3)
        : username.substring(0, 3);
      dbPassword += `.${personalId.substring(personalId.length - 3)}`;
      if (password != dbPassword) resolve(false);
      resolve(true);
    } catch (e) {
      reject({ code: 500 });
    }
  });
};

module.exports.testsecureRoute = async (req, res) => {
  res.send(req.body.tokenData);
};
