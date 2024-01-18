<<<<<<< HEAD
const yup = require("yup");

//-- Access Log --
module.exports.accessLog = async (req, res) => {
  try {
    let startDate = thaiDateToEng(req.body.StartDate);
    let endDate = thaiDateToEng(req.body.EndDate, true);
    const accessList = await findAccessLogList({
      StartDate: startDate,
      EndDate: endDate,
    });
    res.json(accessList);
  } catch (e) {
    //-- if any error occur return server error status --
    if (!e.code) {
      console.error(e);
      res.status(500).end();
    }
    res.status(e.code).end();
    //-- End error handler --
  }
};
//-- End Access Log --

//-- Search for track recode from oag_track --
module.exports.reportSearch = async (req, res) => {
  try {
    let startDate = thaiDateToEng(req.body.StartDate, false, true);
    let endDate = thaiDateToEng(req.body.EndDate, true, true);
    const trackList = await findTrackList({
      StartDate: startDate,
      EndDate: endDate,
      StaffSearchWord: req.body.StaffSearchWord,
      UserSearchWord: req.body.UserSearchWord,
      Role: req.tokenData?.Role,
      UserID: req.tokenData?.UserID,
    });
    res.json(trackList);
  } catch (e) {
    //-- if any error occur return server error status --
    if (!e.code) {
      console.error(e);
      res.status(500).end();
    }
    res.status(e.code).end();
    //-- End error handler --
  }
};
//-- End search for track recode from oag_track --

//query data form oag_tracklog, oag_user, oag_status, oag_inventory_type
const findTrackList = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const whereText = prepareReportSearchWhere(data);
      const [rows, fields] = await globalDB
        .promise()
        .query(
          "select ot.TrackID, ot.TrackTopic, ou1.UserID, ou1.FirstName, ou1.LastName, " +
            "ot.InventoryTypeID, oit.InventoryTypeName , " +
            "CONCAT(DATE_FORMAT(ot.CreateDate, '%d/%m'),'/',YEAR(ot.CreateDate)+543) as createDate, " +
            "ot.TrackDescription, ot.SerialNO, ot.Sticker, ot.StatusID, ots.StatusName, " +
            "CONCAT(ou2.FirstName,' ',ou2.LastName) as RecipientName from oag_track as ot " +
            "left join oag_user as ou1 on ot.CreateUserID = ou1.UserID left join oag_user as ou2 on " +
            "ot.RecipientUserID = ou2.UserID left join oag_trackstatus as ots on ot.StatusID " +
            "= ots.StatusID left join oag_inventory_type as oit on ot.InventoryTypeID = " +
            "oit.InventoryTypeID where ot.ActiveStatus = 0" +
            whereText
        );
      resolve(rows);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- End query data form oag_tracklog, oag_user, oag_status, oag_inventory_type --

//-- find accesslogs --
const findAccessLogList = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows, fields] = await globalDB
        .promise()
        .query(
          "select ID, Method, PathName, RequestDate, IP from oag_accesslog where " +
            "RequestDate >= ? and RequestDate < ?",
          [data.StartDate, data.EndDate]
        );
      resolve(rows);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end find accesslog --

//-- prepare where query for report search --
const prepareReportSearchWhere = (data) => {
  let where = "";
  if (data.StartDate != null)
    where += ` and ot.createDate >= '${data.StartDate}'`;
  if (data.EndDate != null) where += ` and ot.createDate < '${data.EndDate}'`;
  if (data.Role === 1) {
    if (
      data.StaffSearchWord &&
      data.StaffSearchWord.replace(/[^\w.ก-๏]/g, "") != ""
    ) {
      const staffText = data.StaffSearchWord.replace(/[^\w\s.ก-๏]/g, "");
      const staffTextArr = staffText.split(" ");
      if (staffTextArr.length > 1) {
        where += ` and ( ou2.FirstName like '%${staffTextArr[0]}%' or ou2.LastName like '%${staffTextArr[1]}%' )`;
      } else {
        where += ` and ( ou2.Username like '%${staffText}%' or ou2.FirstName like '%${staffText}%' or ou2.LastName like '%${staffText}%' )`;
      }
    }
    if (
      data.UserSearchWord &&
      data.UserSearchWord.replace(/[^\wก-๏.]/g, "") != ""
    ) {
      const userText = data.UserSearchWord.replace(/[^\w\s.ก-๏]/g, "");
      const userTextArr = userText.split(" ");
      if (userTextArr.length > 1) {
        where += ` and ( ou1.FirstName like '%${userTextArr[0]}%' or ou1.LastName like '%${userTextArr[1]}%' )`;
      } else {
        where += ` and ( ou1.Username like '%${userText}%' or ou1.FirstName like '%${userText}%' or ou1.LastName like '%${userText}%' )`;
      }
    }
    where += " limit 100";
  } else {
    where += ` and ot.RecipientUserID = "${data.UserID}"`;
  }
  return where;
};
//-- end prepare query for report search --

// format date dd/mm/YYYY BE to YYYY/mm/dd CE
const thaiDateToEng = (date, end = false, nullAble = false) => {
  try {
    if (date) {
      date = date.split("/");
      date = `${parseInt(date[2]) - 543}-${date[1]}-${date[0]}`;
      end ? (date += " 23:59:59.999") : (date += " 00:00:00.000");
      if (isNaN(new Date(date))) {
        throw { code: 400 };
      }
    } else {
      if (nullAble) {
        return (date = null);
      }
      throw { code: 400 };
    }
    return date;
  } catch (e) {
    throw { code: 400 };
  }
};
//end format date dd/mm/YYYY BE to YYYY/mm/dd CE
=======
//const HttpError = require("../models/http-error");
//const Member = require("../models/Member");
//const bcrypt = require('bcrypt');

const db = require("../connectdb");

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
    const maxUserIdResult = await db.promise().query(getMaxUserIdSql);

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
    const insertResult = await db.promise().query(insertSql, insertValues);

    console.log("Data saved to MySQL:", insertResult);
    res.status(201).send("Data saved successfully");
  } catch (error) {
    console.error("Error saving data to MySQL: ", error);
    res.status(500).send("Internal Server Error");
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
  console.log("finish");
  const sql =
    "SELECT PrefixName,FirstName,LastName,PersonID,Username,OfficeID,PositionName,Email,Telephone FROM oag_user LIMIT 100";
  db.query(sql, (err, results) => {
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
    const checkUserResult = await db
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
    const deleteResult = await db.promise().query(deleteSql, [userIdToDelete]);

    console.log("Data deleted from MySQL:", deleteResult);
    res.status(200).send("Data deleted successfully");
  } catch (error) {
    console.error("Error deleting data from MySQL: ", error);
    res.status(500).send("Internal Server Error");
  }
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
 
    const [searchUserResult] = await db
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
>>>>>>> origin/jo
