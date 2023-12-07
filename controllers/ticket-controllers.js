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
        console.log(e);
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
    console.error(e);
    if (!e.code) {
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
        console.log(e);
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
    console.error(e);
    if (!e.code) {
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
        console.log(e);
        throw { code: 400 };
      });
    //-- end validate update variable --
    //-- update oag_track data --//
    await updateTicketStatus(updateData, (StatusID = 2 ? true : false)).catch(
      (e) => {
        throw e;
      }
    );
    await insertTrackLog(updateData).catch((e) => {
      throw e;
    });
    //-- end update oag_track data --//
    res.status(200).end();
  } catch (e) {
    //-- if any error occur return server error status --
    console.error(e);
    if (!e.code) {
      return res.status(500).end();
    }
    res.status(e.code).end();
    //-- End error handler --
  }
};

//----------------------------------------------------------------------

const insertTicketData = (data) => {
  return new Promise(async (resolve, reject) => {
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
      )
      .catch((e) => {
        console.error(e);
        reject({ code: 500 });
      });
    resolve(dbdata);
  });
};

const updateTicketData = (data) => {
  return new Promise(async (resolve, reject) => {
    const dbdata = await globalDB
      .promise()
      .query(
        "update oag_track set InventoryTypeID = ?, Sticker = ?,SerialNo = ?, TrackTopic = ?," +
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
      )
      .catch((e) => {
        console.error(e);
        reject({ code: 500 });
      });
    resolve(dbdata);
  });
};

const updateTicketStatus = (data, accept = false) => {
  return new Promise(async (resolve, reject) => {
    const updateArr = accept
      ? [data.StatusID, data.UserID, data.TrackID]
      : [data.StatusID, data.TrackID];
    const dbdata = await globalDB
      .promise()
      .query(
        accept
          ? "update oag_track set StatusID = ?, RecipientID = ? where TrackID = ?"
          : "update oag_track set StatusID = ? where TrackID = ?",
        updateArr
      )
      .catch((e) => {
        console.error(e);
        reject({ code: 500 });
      });
    resolve(true);
  });
};

const insertTrackLog = (data) => {
  return new Promise(async (resolve, reject) => {
    const dbdata = await globalDB
      .promise()
      .query(
        `insert into oag_trackLog (TrackID, StatusID, UserID, ActiveStatus) VALUES (?, ?, ?, ?)`,
        [data.TrackID, data.StatusID, data.UserID, 0]
      )
      .catch((e) => {
        //--- save sql command to file ---
        logToFile(
          "insertTrackLog",
          "insert into trackLog (TrackID, StatusID, UserID, ActiveStatus) VALUES " +
            `(${data.TrackID}, ${data.StatusID}, ${data.UserID}, 0)`
        );
        //--- end save sql command ---
        console.error(e);
        reject({ code: 500 });
      });
    resolve(true);
  });
};

//-- Save Error to log file --
const logToFile = (fileName, logText) => {
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
};
//-- End Save Error to log file

//-- Check Variable --
const ticketSchema = (update = false) => {
  return yup.object({
    //--- Schema validation setting ---
    UserID: update ? null : yup.number().required(),
    TrackID: update ? yup.number().required() : null,
    InventoryTypeID: yup.number().required(),
    Sticker: yup.string().ensure(null).nullable(),
    SerialNo: yup.string().ensure(null).nullable(),
    TrackTopic: yup.string().required(),
    TrackDescription: yup.string().ensure().nullable(),
    ContactDetail: yup.string().required(),
  });
};
//
