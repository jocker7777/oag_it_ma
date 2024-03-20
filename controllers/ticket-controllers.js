const yup = require("yup");
const log4js = require("log4js");
const redisConn = require('../redis');
const moment = require("moment");
require('moment/locale/th')
module.exports.create = async (req, res) => {
  try {
    req.body.UserID = req.tokenData.UserID;
    req.body.StatusID = 1; //default create status
    //-- validate insert variable --
    const createData = await ticketSchema()
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate insert variable --
    //-- insert Data to oag_track --//
    const insertDetail = await insertTicketData(createData).catch((e) => {
      throw e;
    });
    //-- end insert oag_track --//
    //-- cached catch--//
    let cachedData = await redisConn.get("tickets");
    let newData = [];
    const currentDate = moment();
    const yearInBE = parseInt(currentDate.format('YYYY')) + 543;
    const currentDateThaiFormat = currentDate.locale('th').format(`DD/MM/${yearInBE} HH:mm`);
    if (cachedData) {
      const loadCachedData = JSON.parse(cachedData);
      newData = loadCachedData.concat({
        TrackID: insertDetail[0].insertId,
        StatusID: 2,
        StatusName: "รอดำเนินการ",
        UpdateDate: currentDateThaiFormat,
        StatusDescription: 'เริ่มต้น'
      })
      await redisConn.set("tickets", JSON.stringify(newData))
    } else {
      await redisConn.set("tickets", JSON.stringify([{
        TrackID: insertDetail[0].insertId,
        StatusID: 2,
        StatusName: "รอดำเนินการ",
        StatusDescription: 'เริ่มต้น',
        UpdateDate: currentDateThaiFormat
      }]))
    }
    //-- cached relaese --//
    //-- insert oag_tracklog --//
    createData.TrackID = insertDetail[0].insertId; //set insertedId to TrackID for TrackLog
    await insertTrackLog(createData).catch((e) => {
      throw e;
    });
    //-- end insert oag_tracklog --//
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

module.exports.updateData = async (req, res) => {
  try {
    //-- validate update variable --
    const updateData = await ticketSchema(true)
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate update variable --
    //-- update oag_track data --//
    await testUpdateTicket(updateData).catch((e) => {
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
module.exports.updateStatus = async (req, res) => {
  try {
    req.body.UserID = req.tokenData.UserID;
    //-- validate update variable --
    const updateData = await yup
      .object({
        UserID: yup.number().required(),
        TrackID: yup.number().required(),
        StatusID: yup.number().required(),
      })
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate update variable --
    //-- update oag_track data --//
    await updateTicketStatus(
      updateData,
      updateData.StatusID == 2 ? true : false
    ).catch((e) => {
      throw e;
    });
    let cachedData = await redisConn.get("tickets");
    let newData = []
    const currentDate = moment();
    const yearInBE = Number(currentDate.format('YYYY')) + 543;
    const currentDateThaiFormat = moment().locale('th').format(`DD/MM/${yearInBE}, HH:mm`);
    if (cachedData) {
      const loadCachedData = JSON.parse(cachedData);
      if (updateData.StatusID === 2) return;
      newData = loadCachedData.concat({
        TrackID: updateData.TrackID,
        StatusDescription: updateData.StatusDescription,
        StatusID: updateData.StatusID,
        StatusName: updateData.StatusID === 3 ? 'เสร็จสมบูรณ์' : updateData.StatusID === 4 ? "ยกเลิกการดำเนินการ" : updateData.StatusID === 5 ? "ปฏิเสธการดำเนินการ" : updateData.StatusID === 6 ? "ส่งต่อรอดำเนินการ" : 'อื่น ๆ',
        UpdateDate: currentDateThaiFormat
      })
      await redisConn.set("tickets", JSON.stringify(newData));
    }
    await insertTrackLog(updateData).catch((e) => {
      throw e;
    });
    await insertTrackLog(updateData).catch((e) => {
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
module.exports.list = async (req, res) => {
  try {
    req.body.UserID = req.tokenData.UserID;
    req.body.Role = req.tokenData.Role;
    //-- validate update variable --
    const queryData = await yup
      .object({
        UserID: yup.number().required(),
        Role: yup.number().required(),
      })
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate update variable --
    //-- find list data --//
    const list = await findTicketList(queryData).catch((e) => {
      throw e;
    });
    //-- find list data --//
    res.json(list);
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
module.exports.single = async (req, res) => {
  const TrackID = parseInt(req.params.id);
  console.log(typeof (TrackID));
  const { UserID } = req.body
  console.log(UserID);
  const data = [UserID, TrackID]
  console.log(data);
  try {
    const single = await findTicketSingle(data).catch((e) => {
      throw e;
    });
    res.json(single)
  } catch (error) {

  }
}


module.exports.completeList = async (req, res) => {
  try {
    req.body.UserID = req.tokenData.UserID;
    //-- validate search variable --
    const queryData = await yup
      .object({
        UserID: yup.number().required(),
      })
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate search variable --
    //-- find list data --//
    const list = await findCompleteTicket(queryData).catch((e) => {
      throw e;
    });
    //-- find list data --//
    res.json(list);
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


module.exports.ownedList = async (req, res) => {
  try {
    req.body.UserID = req.tokenData.UserID;
    //-- validate search variable --
    const queryData = await yup
      .object({
        UserID: yup.number().required(),
      })
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    //-- end validate search variable --
    //-- find list data --//
    const list = await findAcceptedTicketList(queryData).catch((e) => {
      throw e;
    });
    //-- find list data --//
    res.json(list);
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

module.exports.inventoryType = async (req, res) => {
  try {
    //-- find list data --//
    const list = await findInventoryType().catch((e) => {
      throw e;
    });
    //-- find list data --//
    res.json(list);
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
module.exports.trackUpdate = async (req, res) => {
  try {
    const currentDate = moment();
    const yearInBE = Number(currentDate.format('YYYY')) + 543;
    const currentDateThaiFormat = moment().locale('th').format(`DD/MM/${yearInBE}, HH:mm`);
    const { TrackID } = req.body;
    let cachedData = await redisConn.get("tickets")
    const loadCachedData = JSON.parse(cachedData);
    const filterData = loadCachedData.filter(data => data.TrackID === TrackID)
    res.json(filterData)
  } catch (error) {
    res.json({ message: error.message })
  }
}
module.exports.accept = async (req, res) => {

  const UserID = req.body.UserID;
  const TrackID = req.params.id;
  const data = [UserID, TrackID]
  console.log(data);
  try {
    let cachedData = await redisConn.get("tickets");
    let newData = [];
    const currentDate = moment();
    const yearInBE = Number(currentDate.format('YYYY')) + 543;
    const currentDateThaiFormat = currentDate.locale('th').format(`DD/MM/${yearInBE} HH:mm`);
    const loadCachedData = JSON.parse(cachedData);
    if (loadCachedData) {
      newData = loadCachedData.concat({
        TrackID: TrackID,
        StatusID: 3,
        StatusName: "กำลังดำเนินการ",
        UpdateDate: currentDateThaiFormat,
        StatusDescription: 'รับเรื่องแล้ว'
      })
      await redisConn.set("tickets", JSON.stringify(newData))
    } else {
      await redisConn.set("tickets", JSON.stringify([{
        TrackID: TrackID,
        StatusID: 3,
        StatusName: "กำลังดำเนินการ",
        UpdateDate: currentDateThaiFormat,
        StatusDescription: 'รับเรื่องแล้ว'
      }]))
    }

    const accept = await acceptTicket(data).catch((e) => { throw e })
    res.json(accept)
  } catch (error) {
    res.status(error.code).end();
  }
}

//-- Track Status --
module.exports.trackStatus = async (req, res) => {
  try {
    const statusList = await findTrackStatus();
    res.json(statusList);
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

module.exports.closeTicket = async (req, res) => {
  try {
    req.body.UserID = req.tokenData.UserID;
    console.log(req.body);
    const queryData = await yup
      .object({
        UserID: yup.number().required(),
        TrackID: yup.number().required(),
        StatusID: yup.number().required().notOneOf([1, 3]),
      })
      .validate(req.body)
      .catch((e) => {
        throw { code: 400, message: "ไม่สามารถอัพเดตสถานะได้" };
      });
    const filterData = [queryData.TrackID, queryData.UserID]
    let cachedData = await redisConn.get("tickets");
    let newData = [];
    const currentDate = moment();
    const yearInBE = Number(currentDate.format('YYYY')) + 543;
    const currentDateThaiFormat = currentDate.locale('th').format(`DD/MM/${yearInBE} HH:mm`);
    if (cachedData) {
      const loadCachedData = JSON.parse(cachedData);
      newData = loadCachedData.concat({
        TrackID: queryData.TrackID,
        StatusID: 3,
        StatusName: "เสร็จสมบูรณ์",
        UpdateDate: currentDateThaiFormat
      })
      await redisConn.set("tickets", JSON.stringify(newData))
    }

    const closeTicketStatus = await globalDB.promise().query("UPDATE oag_track SET StatusID = 3 WHERE TrackID = ? AND RecipientUserID = ?", filterData)
    res.status(200).json({
      data: closeTicketStatus
    })
  } catch (error) {
    res.status(500).json({
      message: `${error?.message}`
    })
  }
}
//-- End Track Status --
//----------------------------------------------------------------------
//-- insert oag_track function --
const insertTicketData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbdata = await globalDB
        .promise()
        .query(
          "insert into oag_track " +
          "(CreateUserID, InventoryTypeID, Sticker, SerialNo, TrackTopic, TrackDescription," +
          "ContactDetail, StatusID, ActiveStatus) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)",
          [
            data.UserID,
            data.InventoryTypeID,
            data.Sticker,
            data.SerialNo,
            data.TrackTopic,
            data.TrackDescription,
            data.ContactDetail,
          ]
        );

      resolve(dbdata);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end insert function --

//-- accept ticket --
const acceptTicket = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbdata = await globalDB
        .promise()
        .query(
          "update oag_track set RecipientUserID = ?,StatusID = 2  where TrackID = ?",
          data
        );
      resolve(dbdata)
    } catch (error) {
      console.log(error);
      reject(error);
    }
  })
}
//-- end accept ticket
//-- update oag_track function --
const updateTicketData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbdata = await globalDB
        .promise()
        .query(
          "update oag_track set InventoryTypeID = ?, Sticker = ?, SerialNo = ?, TrackTopic = ?," +
          "TrackDescription = ?, ContactDetail = ? where TrackID = ?",
          [
            data.InventoryTypeID,
            data.Sticker,
            data.SerialNo,
            data.TrackTopic,
            data.TrackDescription,
            data.ContactDetail,
            data.TrackID,
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
//-- start test update ticket function --
const testUpdateTicket = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const setClause = [];
      const params = [];

      // temp fix null  insertr  
      for (const key in data) {
        if (["InventoryTypeID", "Sticker", "SerialNo", "TrackTopic", "TrackDescription", "ContactDetail"].includes(key) && data[key] !== undefined && data[key] !== '') {
          setClause.push(`${key} = ?`);
          params.push(data[key])
        }
      }
      if (setClause.length === 0) {
        // If no valid fields are provided, resolve immediately
        resolve("No valid fields to update");
        return;
      }
      const updateQuery = `UPDATE oag_track SET ${setClause.join(", ")} WHERE TrackID = ?`
      params.push(data.TrackID)

      const [rows, fields] = await globalDB.promise().execute(updateQuery, params)
      resolve(rows)
    } catch (error) {
      console.log(error);
      reject(error)
    }
  })
}
//-- end test update ticket function --
//-- update oag_track status function --
const updateTicketStatus = (data, accept = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updateArr = accept
        ? [data.StatusID, data.UserID, data.TrackID]
        : [data.StatusID, data.TrackID];
      const [dbdata] = await globalDB
        .promise()
        .query(
          accept
            ? "UPDATE oag_track set StatusID = ?, RecipientUserID = ? WHERE TrackID = ? AND StatusID = 1"
            : data.StatusID === 1
              ? "UPDATE oag_track set StatusID = ?, RecipientUserID = NULL  where TrackID = ?"
              : "update oag_track set StatusID = ? where TrackID = ?",
          updateArr
        );
      if (accept) {
        if (dbdata?.affectedRows === 0) {
          reject({ code: 409 });
        }
      }
      resolve(true);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end update status function --//

//-- finished ticket function --//

const closeTicketStatus = (data, accept = false) => {
  return new Promise(async (resolve, reject) => {
    const filterData = [data.TrackID, data.UserID]
    try {
      const [dbData] = await globalDB.promise()
        .query(
          accept ? "UPDATE oag_track SET StatusID = 3 WHERE TrackID = ? AND RecipientUserID = ?" : "",
          filterData
        )
      resolve(true)
    } catch (error) {
      console.log(error);
    }

  })
}





//-- insert oag_tracklog --
const insertTrackLog = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbdata = await globalDB
        .promise()
        .query(
          `insert into oag_tracklog (TrackID, StatusID, UserID, ActiveStatus) VALUES (?, ?, ?, ?)`,
          [data.TrackID, data.StatusID, data.UserID, 0]
        );

      resolve(true);
    } catch (e) {
      //--- save sql command to file ---
      logToFile(
        "insertTrackLog",
        "insert into trackLog (TrackID, StatusID, UserID, ActiveStatus) VALUES " +
        `(${data.TrackID}, ${data.StatusID}, ${data.UserID}, 0)`
      );
      //--- end save sql command ---
      console.error(e);
      reject({ code: 500 });
    }
  });
};
// -- end insert oag_tracklog

//-- Save Error to log file --
const logToFile = (fileName, logText) => {
  try {
    log4js.configure({
      appenders: {
        [fileName]: {
          type: "file",
          filename: `logs/${fileName}.log`,
          compress: true,
        },
      },
      categories: {
        default: { appenders: [fileName], level: "error" },
      },
    });
    const logger = log4js.getLogger(fileName);
    logger.error(logText);
  } catch (e) {
    console.error(e);
    reject({ code: 500 });
  }
};
//-- End Save Error to log file

//-- Check Variable --
const ticketSchema = (update = false) => {
  return yup.object({
    //--- Schema validation setting ---
    UserID: update ? null : yup.number().nullable(true),
    TrackID: update ? yup.number().required() : null,
    InventoryTypeID: update ? null : yup.number().required(),
    Sticker: yup.string().nullable(),
    SerialNo: yup.string().nullable(),
    TrackTopic: update ? null : yup.string().required(),
    TrackDescription: yup.string().ensure().nullable(),
    ContactDetail: update ? null : yup.string().required(),
  });
};
//-- end check variable --


const findTicketSingle = (data) => {
  return new Promise(async (resolve, reject) => {
    console.log(data[1]);
    try {
      const [rows, field] = await globalDB.promise().query(
        `SELECT TrackID, ot.InventoryTypeID,Sticker,SerialNO, TrackTopic, TrackDescription, ContactDetail, ot.StatusID, StatusName,ott.InventoryTypeName,
       DATE_FORMAT(DATE_ADD(ot.CreateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i') AS CreateDate,DATE_FORMAT(DATE_ADD(ot.UpdateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i') AS UpdateDate,CONCAT_WS(' ',creater.FirstName, creater.LastName) AS CreateName,CONCAT_WS(' ', accepter.FirstName, accepter.LastName) AS RecipientName
       FROM oag_track ot LEFT JOIN oag_trackstatus ost on ot.StatusID = ost.StatusID 
       LEFT JOIN oag_inventory_type ott ON ot.InventoryTypeID = ott.InventoryTypeID
       LEFT JOIN oag_user creater ON ot.CreateUserID = creater.UserID 
       LEFT JOIN oag_user accepter ON ot.RecipientUserID = accepter.UserID 
       WHERE TrackID = ? AND ot.ActiveStatus=0 AND (ot.RecipientUserID = ? OR ot.CreateUserID = ?)

      `,
        [data[1], data[0], data[0]]
      );
      resolve(rows);
    } catch (error) {
      reject({ code: 500 })
    }
  })
}





//-- find ticket list --
const findTicketList = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows, fields] = await globalDB.promise().query(
        "select TrackID, InventoryTypeID,Sticker,SerialNO, TrackTopic, TrackDescription, ContactDetail, ot.StatusID, " +
        "StatusName, DATE_FORMAT(DATE_ADD(ot.CreateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i')" +
        "as CreateDate,DATE_FORMAT(DATE_ADD(ot.UpdateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i')" +
        "as UpdateDate,CONCAT_WS(' ', creater.FirstName, creater.LastName) AS CreateName, " +
        "CONCAT_WS(' ', accepter.FirstName, accepter.LastName) AS RecipientName " +
        "from oag_track ot left join oag_trackstatus ost on ot.StatusID = ost.StatusID " +
        "left join oag_user creater on ot.CreateUserID = creater.UserID " +
        "left join oag_user accepter on ot.RecipientUserID = accepter.UserID " +
        "where ot.ActiveStatus=0 and " +
        (data.Role === 3 ? "ot.CreateUserID = ? and ot.StatusID <> 3" : "ot.StatusID = 1"),
        //: "(ot.RecipientUserID = ? or ot.RecipientUserID IS NULL )"),
        [data.UserID]
      );
      resolve(rows);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end find ticket list --

//-- find accepted ticket list --
const findAcceptedTicketList = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows, fields] = await globalDB
        .promise()
        .query(
          "select TrackID, InventoryTypeID,RecipientUserID, Sticker,SerialNO,TrackTopic, TrackDescription, ContactDetail, ot.StatusID, " +
          "StatusName, DATE_FORMAT(DATE_ADD(ot.CreateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i')" +
          "as CreateDate,DATE_FORMAT(DATE_ADD(ot.UpdateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i')" +
          "as UpdateDate,CONCAT_WS(' ',creater.FirstName, creater.LastName) AS CreateName, " +
          "CONCAT_WS(' ', accepter.FirstName, accepter.LastName) AS RecipientName " +
          "from oag_track ot left join oag_trackstatus ost on ot.StatusID = ost.StatusID " +
          "left join oag_user creater on ot.CreateUserID = creater.UserID " +
          "left join oag_user accepter on ot.RecipientUserID = accepter.UserID " +
          "where ot.ActiveStatus=0 AND (ot.RecipientUserID = ? OR ot.CreateUserID = ?) AND ot.StatusID NOT IN (1,3)",
          [data.UserID, data.UserID]
        );
      resolve(rows);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end find accepted ticket list --

const findCompleteTicket = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows, fields] = await globalDB
        .promise()
        .query(
          "select TrackID, InventoryTypeID, Sticker,SerialNO,TrackTopic, TrackDescription, ContactDetail, ot.StatusID, " +
          " StatusName, DATE_FORMAT(DATE_ADD(ot.CreateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i')" +
          "as CreateDate,DATE_FORMAT(DATE_ADD(ot.UpdateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i')" +
          "as UpdateDate,CONCAT_WS(' ',creater.FirstName, creater.LastName) AS CreateName, " +
          "CONCAT_WS(' ', accepter.FirstName, accepter.LastName) AS RecipientName " +
          "from oag_track ot left join oag_trackstatus ost on ot.StatusID = ost.StatusID " +
          "left join oag_user creater on ot.CreateUserID = creater.UserID " +
          "left join oag_user accepter on ot.RecipientUserID = accepter.UserID " +
          "where ot.ActiveStatus = 0 and" + (data.Role === 3 ? " ot.CreateUserID = ?" : " ot.RecipientUserID = ? ") + " and ot.StatusID = 3",
          [data.UserID]
        );
      resolve(rows);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
}





//-- find inventoryType list --
const findInventoryType = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows, fields] = await globalDB
        .promise()
        .query(
          "select InventoryTypeID, InventoryTypeName from oag_inventory_type where ActiveStatus = 0"
        );

      resolve(rows);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end find inventoryType list --

//-- find trackstatus --
const findTrackStatus = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows, fields] = await globalDB
        .promise()
        .query(
          "select StatusId, StatusName, StatusDescription from oag_trackstatus where " +
          "ActiveStatus = 0"
        );
      resolve(rows);
    } catch (e) {
      console.error(e);
      reject({ code: 500 });
    }
  });
};
//-- end find trackstatus --
