const yup = require("yup");
const verifyToken = require("../public/authen-middleware").verifyToken;

//-- Update oag_user --
module.exports.updateData = async (req, res) => {
  try {
    //-- validate update variable --
    if (req.tokenData.Role === 3 && req.tokenData.UserID != req.UserID)
      throw { code: 400 };
    const updateData = await updateSchema(
      req.tokenData.Role,
      req.tokenData.UserID
    )
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate update variable --
    //-- update oag_user data without messing with username --//
    await updateUserData(updateData).catch((e) => {
      throw e;
    });
    //-- end update oag_user data --//
    res.status(200).end();
  } catch (e) {
    //-- if any error occur return server error status --
    if (!e.code) {
      console.error(e);
      return res.status(500).end();
    }
    res.status(e.code).end();
    //-- End error handler --
  }
};
//-- End Update oag_user --

//-- insert into oag_user --
module.exports.insertUser = async (req, res) => {
  try {
    //-- validate insert variable --
    const token = req.body.token;
    let insertData = await insertSchema()
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate insert variable --
    insertData = setUserNameData(insertData);
    if (!insertData) throw { code: 400 };
    //-- insert oag_user data --//
    checkRole = await verifyToken(token).catch((e) => {
      console.error(e);
      return false;
    });
    //-- set role if insert from role admin --
    !checkRole ? (insertData.Role = 3) : (insertData.Role = insertData.Role);
    //-- end set role --
    await insertUserData(insertData).catch((e) => {
      throw e;
    });
    //-- end insert oag_user data --//
    res.status(200).end();
  } catch (e) {
    //-- if any error occur return server error status --
    if (!e.code) {
      console.error(e);
      return res.status(500).end();
    }
    res.status(e.code).end();
    //-- End error handler --
  }
};
//-- End insert into oag_user --

// //-- Search user --
// module.exports.searchUser = async (req, res) => {
//   try {
//     //-- validate Search variable --
//     const searchData = await updateSchema()
//       .validate(req.body)
//       .catch((e) => {
//         throw { code: 400 };
//       });
//     //-- end validate update variable --
//     //-- update oag_user data without messing with username --//
//     await updateUserData(updateData).catch((e) => {
//       throw e;
//     });
//     //-- end update oag_user data --//
//     res.status(200).end();
//   } catch (e) {
//     //-- if any error occur return server error status --
//     if (!e.code) {
//       console.error(e);
//       return res.status(500).end();
//     }
//     res.status(e.code).end();
//     //-- End error handler --
//   }
// };
// //-- End Search user --

//-- Check update Variable --
const updateSchema = (role, updaterID) => {
  return yup.object({
    //--- Schema validation setting ---
    UserID: role === 3 ? updaterID : yup.number().required(),
    FirstName: yup
      .string()
      .matches(/^[ก-๏]+$/gm)
      .nullable(),
    LastName: yup
      .string()
      .matches(/^[ก-๏]+$/gm)
      .nullable(),
    FirstNameEng: yup
      .string()
      .trim()
      .required()
      .matches(/^[a-zA-Z]+$/gm),
    LastNameEng: yup
      .string()
      .trim()
      .required()
      .matches(/^[a-zA-Z]+$/gm),
    Telephone: yup.string().trim().nullable(),
    PersonID: yup.string().trim().required().matches(/[0-9]/gm),
    Email: yup.string().trim().nullable(),
    OfficeID: yup.number().required(),
    Role: role === 3 ? 3 : yup.number().required(),
  });
};
//-- end check update variable --

//-- Check insert Variable --
const insertSchema = () => {
  return yup.object({
    //--- Schema validation setting ---
    FirstName: yup
      .string()
      .matches(/^[ก-๏]+$/gm)
      .nullable(),
    LastName: yup
      .string()
      .matches(/^[ก-๏]+$/gm)
      .nullable(),
    FirstNameEng: yup
      .string()
      .trim()
      .required()
      .matches(/^[a-zA-Z]+$/gm),
    LastNameEng: yup
      .string()
      .trim()
      .required()
      .matches(/^[a-zA-Z]+$/gm),
    Username: yup.string().trim().nullable(),
    Telephone: yup.string().trim().nullable(),
    PersonID: yup
      .string()
      .trim()
      .required()
      .min(13)
      .max(13)
      .matches(/^[0-9]+$/gm)
      .length(13),
    Email: yup.string().trim().nullable(),
    OfficeID: yup.number().required(),
    Role: yup.number().default(3),
    activeStatus: yup.number().default(1),
  });
};
//-- end check insert variable -

//-- update oag_user function --
const updateUserData = (data, role) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbdata = await globalDB
        .promise()
        .query(
          "update oag_user set FirstName = ?, LastName = ?, FirstNameEng = ?, LastNameEng = ?," +
            "Telephone = ?, PersonID = ?, Email = ?, OfficeID = ?, Role = ? where UserID = ?",
          [
            data.FirstName,
            data.LastName,
            data.FirstNameEng,
            data.LastNameEng,
            data.Telephone,
            data.PersonID,
            data.Email,
            data.OfficeID,
            role === 3 ? 3 : data.Role,
            data.UserID,
          ]
        );
      resolve(dbdata);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end update oag_user function --

//-- insert oag_user function --
const insertUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbdata = await globalDB
        .promise()
        .query(
          "insert into oag_user (Username, Password, FirstName, LastName, FirstNameEng, LastNameEng," +
            "Telephone, PersonId, Email, OfficeID, Role, ActiveStatus) VALUES " +
            "( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0 )",
          [
            data.Username,
            data.Password,
            data.FirstName,
            data.LastName,
            data.FirstNameEng,
            data.LastNameEng,
            data.Telephone,
            data.PersonID,
            data.Email,
            data.OfficeID,
            data.Role,
          ]
        );
      resolve(dbdata);
    } catch (e) {
      if (e.errno === 1062) return reject({ code: 409 });
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end update oag_user function --

//-- set username and password for insert oag_user data --//
const setUserNameData = (data) => {
  try {
    if (!data.Username)
      data.Username = `${data.FirstNameEng}.${data.LastNameEng.substring(
        0,
        1
      )}`;
    if (!data.Password)
      data.Password = `${data.FirstNameEng.substring(
        0,
        3
      )}${data.PersonID.substring(data.PersonID.length - 3)}`;
    return data;
  } catch (e) {
    return false;
  }
};
//-- End set username and password --

//-- Check Search Variable --
const searchUserSchema = () => {
  return yup.object({
    //--- Schema validation setting ---
    FirstName: yup
      .string()
      .matches(/^[ก-๏]+$/gm)
      .nullable(),
    LastName: yup
      .string()
      .matches(/^[ก-๏]+$/gm)
      .nullable(),
    FirstNameEng: yup
      .string()
      .trim()
      .required()
      .matches(/^[a-zA-Z]+$/gm),
    LastNameEng: yup
      .string()
      .trim()
      .required()
      .matches(/^[a-zA-Z]+$/gm),
    Username: yup.string().trim().nullable(),
    Telephone: yup.string().trim().nullable(),
    PersonID: yup
      .string()
      .trim()
      .required()
      .matches(/^[0-9]+$/gm)
      .length(13),
    Email: yup.string().trim().nullable(),
    OfficeID: yup.number().required(),
    Role: yup.number().default(3),
    activeStatus: yup.number().default(1),
  });
};
//-- end check search variable -
