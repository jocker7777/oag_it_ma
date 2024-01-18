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
