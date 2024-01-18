const jwtDecode = require("./authen-middleware").LogTokenDecode;
const log4js = require("log4js");

module.exports.accessLog = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  jwtDecode(req.body.token).then((UserID) => {
    const data = {
      Method: req.method,
      PathName: req.originalUrl,
      RequestBody: Object.assign(req.body),
      IP: ip.replace("::ffff:", ""),
      UserID: UserID ? UserID : null,
    };
    delete data.RequestBody.token;
    insertAccessLog(data).then((isSave) => {
      if (!isSave)
        logToFile(
          `{ "Method" : "${data.Method}", "PathName" : "${data.PathName}"` +
            `, "RequestDate" : "${new Date().toISOString()}", "RequestBody" : ${JSON.stringify(
              req.body
            )}` +
            `", IP" : "${data.IP}", "UserID" : ${data.UserID} }`
        );
    });
  });
  next();
};

//-- insert access log --
const insertAccessLog = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbdata = await globalDB
        .promise()
        .query(
          `insert into oag_accesslog (Method, PathName,  RequestBody, IP, UserID) VALUES (?, ?, ?, ?, ?)`,
          [
            data.Method,
            data.PathName,
            JSON.stringify(data.RequestBody),
            data.IP,
            data.UserID,
          ]
        );

      resolve(true);
    } catch (e) {
      //--- save sql command to file ---
      resolve(false);
      //--- end save sql command ---
    }
  });
};
//-- end access log --

//-- log file --
const logToFile = (logText) => {
  try {
    log4js.configure({
      appenders: {
        "access-log": {
          type: "file",
          layout: { type: "messagePassThrough" },
          filename: `logs/access-log.log`,
          compress: true,
        },
      },
      categories: {
        default: { appenders: ["access-log"], level: "error" },
      },
    });
    const logger = log4js.getLogger("access-log");
    logger.error(logText);
  } catch (e) {
    console.error(e);
  }
};
//-- end log file --
