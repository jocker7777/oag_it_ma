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

    // สร้างคำสั่ง SQL เพื่อค้นหาข้อมูล
    const searchUserSql =
      "SELECT * FROM oag_user WHERE (FirstName LIKE ? and LastName LIKE ? and Username LIKE ? and PersonID = ?)";
      //"select *  from oag_user where 1=1 and (nvl(FirstName,0)=0 or FirstName like ?  and (nvl(LastName,0)=0 or LastName like ? and  (nvl(UserName,0)=0 or UserName like ?  and (nvl(PersonID,0)=0 or PersonID = ?";
    // "    SELECT oag_user.* FROM oag_user WHERE (UserID = ? OR ? = '') AND (FirstName LIKE ? OR ? = '') AND  (LastName LIKE ? OR ? = '') AND (Username LIKE ? OR ? = '') AND (PersonID = ? OR ? = '')";

    // เพิ่มค่าที่ใช้ค้นหาลงในคำสั่ง SQL
    const searchValues = [
    //   `%${FirstName || 0}%`,
    //   `%${LastName || 0}%`,
    //   `%${UserName || 0}%`,
    //   PersonID || 0,
    // ];
       `%${FirstName}%`,
      `%${LastName}%`,
      `%${UserName}%`,
      PersonID ,
    ];

    //console.log(req.body.LastName);

    // เรียกใช้คำสั่ง SQL
    const [searchUserResult] = await db
      .promise()
      .query(searchUserSql, searchValues);
    console.log(searchUserResult);

    // ตรวจสอบจำนวนแถวที่คืนค่า
    res.json(searchUserResult[0]);
    // if (searchUserResult.length > 0) {
    //   // มีผู้ใช้ที่ตรงตามเงื่อนไขการค้นหา
    //   // คืนค่าข้อมูลผู้ใช้ไปยังไคลเอนต์
    //   res.json(searchUserResult[0]);
    // } else {
    //   // ไม่มีผู้ใช้ที่ตรงตามเงื่อนไขการค้นหา
    //   res.status(404).json({ message: "User not found" });
    // }
  } catch (error) {
    console.error(error);
    // Handle errors appropriately
    next(error); // Pass the error to the next middleware
  }
};

exports.createuseradmin = createuseradmin;
exports.deleteuseradmin = deleteuseradmin;
exports.searchuser = searchuser;
exports.login = login;
exports.readall = readall;
