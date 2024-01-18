const yup = require("yup");

module.exports.updateData = async (req, res) => {
  try {
    //-- validate update variable --
    if (req.tokenData.Role === 3 && req.tokenData.UserID != req.UserID)
      throw { code: 400 };
    const updateData = await userSchema(
      req.tokenData.Role,
      req.tokenData.UserID
    )
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate update variable --
    //-- update oag_track data --//
    await updateUserData(updateData).catch((e) => {
      throw e;
    });
    //-- end update oag_track data --//
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

//-- Check Variable --
const userSchema = (role, updaterID) => {
  return yup.object({
    //--- Schema validation setting ---
    UserID: role === 3 ? updaterID : yup.number().required(),
    FirstName: yup.string().nullable(),
    LastName: yup.string().nullable(),
    FirstNameEng: yup.string().trim().required(),
    LastNameEng: yup.string().nullable(),
    Telephone: yup.string().trim().nullable(),
    PersonID: yup.string().trim().required(),
    Email: yup.string().trim().nullable(),
    OfficeID: yup.number().required(),
    Role: role === 3 ? 3 : yup.number().required(),
  });
};
//-- end check variable --

//-- update oag_track function --
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
//-- end update ticket function --
