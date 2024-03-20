//const HttpError = require("../models/http-error");
//const Member = require("../models/Member");
//const bcrypt = require('bcrypt');

const yup = require('yup')
const verifyToken = require("../public/authen-middleware").verifyToken;

//-----------------------------------create_user_admin--------------------
const createuseradmin = async (req, res, next) => {
  try {
    const data = req.body;
    const {
      PrefixName,
      FirstName,
      LastName,
      Telephone,
      PersonID,
      Email,
      OfficeID,
      ProvinceName,
      PositionName,
      Password,
    } = data;

    // ดึงค่า user ID สูงสุดปัจจุบันจากฐานข้อมูล
    const getMaxUserIdSql = "SELECT MAX(UserID) AS maxUserId FROM `oag_user`";
    const maxUserIdResult = await globalDB.promise().query(getMaxUserIdSql);

    let nextUserId = 1; // ตั้งค่าเริ่มต้นที่ 1 หากยังไม่มีผู้ใช้ในฐานข้อมูล

    if (
      maxUserIdResult[0].length > 0 &&
      maxUserIdResult[0][0].maxUserId !== null
    ) {
      nextUserId = maxUserIdResult[0][0].maxUserId + 1;
    }

    console.log("Next User ID:", nextUserId);
    //let OfficeID = 6 ;
    // อัปเดต user ID ในอ็อบเจ็กต์ข้อมูล
    data.UserID = nextUserId;

    const insertSql =
      "INSERT INTO `oag_user`(`UserID`, `PersonID`,`PrefixID`, `PrefixName`, `FirstName`, `LastName`,`FirstNameEng`,`LastNameEng`, `Telephone`,  `Email`,  `PositionName`,  `OfficeID`, `Password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?, ?, ?)";
    const insertValues = [
      nextUserId,
      PersonID,
      null,
      PrefixName,
      FirstName,
      LastName,
      null,
      null,
      Telephone,
      Email,
      PositionName,
      OfficeID,
      Password,
    ];

    // แทรกข้อมูลลงในฐานข้อมูล
    const insertResult = await globalDB.promise().query(insertSql, insertValues);

    console.log("Data saved to MySQL:", insertResult);
    res.status(201).send("Data saved successfully");
  } catch (error) {
    console.error("Error saving data to MySQL: ", error);
    res.status(500).send("Internal Server Error");
  }
};
//schema
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

module.exports.insertUser = async (req,res) => {
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
}
//---------------------- Insert User Data-----------------

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
//---------------------- Insert User Data-----------------
//---------------------- Set Username Data -----------------
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

//-------------------login-------------------------------------

const login = async (req, res, next) => {
  //console.log(req.body);
  const data = req.body.data;
  const userName = data.userName;
  const password = data.password;

  console.log(userName);
  console.log(password);

  //let existingUser;

  try {
    const user = await Member.findOne({ userName });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed." });
    }
    console.log("User Found");

    const passwordMatch = await bcrypt.compare(password, user.hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    res.status(200).json({ message: "Authentication successful." });
    console.log("finish");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

//-------------readall---------------
const readall = async (req, res) => {
  req.body.UserID = req.tokenData.UserID;
  
  const sql =
  `SELECT oag_user.UserID,oag_user.PrefixName,oag_user.FirstName,oag_user.LastName,oag_user.PersonID,oag_user.Username,oag_user.PositionName,oag_user.Role,oag_user.Email,oag_user.Telephone,
  oag_user.ActiveStatus,oag_office.OfficeName as OfficeName FROM oag_user INNER JOIN oag_office ON oag_user.OfficeID = oag_office.OfficeID ORDER BY UserID DESC LIMIT 1000`;
    // `SELECT oag_user.* , oag_office.OfficeName as OfficeName FROM oag_user INNER JOIN oag_office ON oag_user.OfficeID = oag_office.OfficeID ORDER BY UserID DESC LIMIT 1000`;
  globalDB.query(sql, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log("data send success");
      res.status(200).json(results);
    }
  });
};

//-------------User_Delete_Admin---------------
const deleteuseradmin = async (req, res, next) => {
  try {
    const userIdToDelete = req.body.UserID; // หรือจะใช้ req.body.userId ก็ได้ตามการใช้งาน
    console.log(req.body);
    console.log(userIdToDelete);

    // เช็คว่ามีข้อมูล UserID ที่ต้องการลบหรือไม่
    const checkUserSql = "SELECT * FROM `oag_user` WHERE `UserID` = ?";
    const checkUserResult = await globalDB
      .promise()
      .query(checkUserSql, [userIdToDelete]);

    if (checkUserResult[0].length === 0) {
      // ถ้าไม่มีข้อมูล UserID ที่ต้องการลบ
      res.status(404).send("User not found");
      return;
    }

    // ถ้ามีข้อมูล UserID ที่ต้องการลบ
    //const deleteSql = 'DELETE FROM `oag_user` WHERE `UserID` = ?';
    const deleteSql =
      "UPDATE `oag_user` SET `ActiveStatus` = 1 WHERE `UserID` = ?";
    const deleteResult = await globalDB.promise().query(deleteSql, [userIdToDelete]);

    console.log("Data deleted from MySQL:", deleteResult);
    res.status(200).send("Data deleted successfully");
  } catch (error) {
    console.error("Error deleting data from MySQL: ", error);
    res.status(500).send("Internal Server Error");
  }
};
const userSchema = () => {
  return yup.object({
    UserID: yup.number().required(),
    FirstName: yup.string().ensure(null).nullable(),
    LastName: yup.string().ensure(null).nullable(),
    Email: yup.string().ensure(null).nullable(),
    Telephone: yup.string().nullable(),
    ActiveStatus: yup.number().nullable(),
  })
}
const update = async (req, res) => {
  const updateData = await userSchema().validate(req.body)
  try {
    await queryUpdate(updateData).catch((e) => { throw { code: e } })
    res.status(200).json({ message: `swim good` })
  } catch (error) {
    console.warn(`this is error warning from backend : ${error}`)
  }
}
const queryUpdate = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create arrays to store SET clause and parameters
      const setClause = [];
      const params = [];
      const UserID = data?.UserID;

      // const updateQuery = `UPDATE oag_user SET ActiveStatus = ? WHERE UserID = ?`
      // Iterate over the keys in the data object
      for (const key in data) {
        // Check if the key is a valid column in the table and value is not undefined or empty
        if (["FirstName", "LastName", "Email", "Telephone", "ActiveStatus", "PersonID", "OfficeID","Role"].includes(key) && data[key] !== undefined && data[key] !== "") {

          if (key === "ActiveStatus") {
            const selectQuery = `SELECT ActiveStatus FROM oag_user WHERE UserID = ?`
            const [selectResult] = await globalDB.promise().query(selectQuery, UserID)
            if (selectResult.length === 0) {
              return res.status(404).json({ error: 'User Not Found' });
            }

            // For toggle active statuss
            const currentStatus = selectResult[0].ActiveStatus;
            const newStatus = currentStatus === 0 ? 1 : 0;
            setClause.push(`${key} = ?`);
            params.push(newStatus);

          } else {
            setClause.push(`${key} = ?`);
            params.push(data[key]);
          }
        }
      }
      // Check if there are valid fields to update
      if (setClause.length === 0) {
        // If no valid fields are provided, resolve immediately
        resolve("No valid fields to update");
        return;
      }

      // Construct the dynamic SQL query
      const sqlQuery = `UPDATE oag_user SET ${setClause.join(", ")} WHERE UserID = ?`;

      // Add the UserID to the parameters
      params.push(data.UserID);

      // Execute the query
      const [rows, fields] = await globalDB.promise().execute(sqlQuery, params);

      // 'rows' contains information about the affected rows
      resolve(rows);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};


//-------------------------------------------User_Search---------------------------------------------------------//
const searchuser = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    const { FirstName, LastName, UserName, PersonID } = data;

    // Replace undefined values with 0
    const searchValues = [
      `%${FirstName}%`,
      `%${LastName}%`,
      `%${UserName}%`,
      PersonID,
    ];
    //console.log(LastName);

    // Rest of the code remains unchanged
    const searchUserSql =
      //"select * from oag_user where 1=1 and (nvl(FirstName,0)=0 or FirstName like ?  and (nvl(LastName,0)=0 or LastName like ? and  (nvl(UserName,0)=0 or UserName like ?  and (nvl(PersonID,0)=0 or PersonID = ?";
      //"SELECT * FROM oag_user WHERE (FirstName LIKE ? and LastName LIKE ? and Username LIKE ? and PersonID = ?)";
      "SELECT * FROM oag_user where ((FirstName is undefined ) or (FirstName like ?)) and ((LastName is undefined) or (LastName like ?)) and ((UserName is undefined) or (UserName like ?))and ((PersonID is undefined) or (PersonID = ?))";

    const [searchUserResult] = await globalDB
      .promise()
      .query(searchUserSql, searchValues);
    console.log("Number of rows:", searchUserResult.length);
    console.log(db
      .promise()
      .query(searchUserSql, searchValues));
    res.json(searchUserResult[0]);
    // if (searchUserResult.length > 0) {
    //   res.json(searchUserResult[0]);
    // } else {
    //   res.status(404).json({ message: "User not found" });
    // }
  } catch (error) {
    console.error(error);
    next(error);
  }
};


exports.createuseradmin = createuseradmin;
exports.deleteuseradmin = deleteuseradmin;
exports.searchuser = searchuser;
exports.login = login;
exports.readall = readall;
exports.update = update;
