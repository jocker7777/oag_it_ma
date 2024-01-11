const yup = require("yup");
const log4js = require("log4js");

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
    await updateTicketData(updateData).catch((e) => {
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
            ? "update oag_track set StatusID = ?, RecipientUserID = ? where TrackID = ? and StatusID = 1"
            : "update oag_track set StatusID = ? where TrackID = ?",
          updateArr
        );
      if (accept) {
        if (dbdata?.affectedRows == 0) {
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
    InventoryTypeID: yup.number().required(),
    Sticker: yup.string().nullable(),
    SerialNo: yup.string().nullable(),
    TrackTopic: yup.string().required(),
    TrackDescription: yup.string().ensure().nullable(),
    ContactDetail: yup.string().required(),
  });
};
//-- end check variable --

//-- find ticket list --
const findTicketList = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows, fields] = await globalDB
        .promise()
        .query(
          "select TrackID, InventoryTypeID, TrackTopic, TrackDescription, ContactDetail, ot.StatusID, " +
            " StatusName, DATE_FORMAT(DATE_ADD(ot.CreateDate, INTERVAL 543 YEAR), '%d/%m/%Y %H:%i')" +
            "as CreateDate, CONCAT_WS(' ', creater.FirstName, creater.LastName) AS CreateName, " +
            "CONCAT_WS(' ', accepter.FirstName, accepter.LastName) AS RecipientName " +
            "from oag_track ot left join oag_trackstatus ost on ot.StatusID = ost.StatusID " +
            "left join oag_user creater on ot.CreateUserID = creater.UserID " +
            "left join oag_user accepter on ot.RecipientUserID = accepter.UserID " +
            "where ot.ActiveStatus=0 and " +
            (data.Role === 3
              ? "ot.CreateUserID = ?"
              : "(ot.RecipientUserID = ? or ot.RecipientUserID IS NULL )"),
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

//-- find ticket list --
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
//-- end find ticket list --

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
