const yup = require("yup");

module.exports.accessLog = async (req, res) => {
  try {
    let startDate = req.body.StartDate;
    let endDate = req.body.EndDate;
    try {
      startDate = startDate.split("/");
      endDate = endDate.split("/");
      startDate = `${parseInt(startDate[2]) - 543}-${startDate[1]}-${
        startDate[0]
      } 00:00:00.000`;
      endDate = `${parseInt(endDate[2]) - 543}-${endDate[1]}-${
        endDate[0]
      } 23:59:59.999`;
      if (isNaN(new Date(startDate)) || isNaN(new Date(endDate)))
        throw { code: 400 };
    } catch (e) {
      throw { code: 400 };
    }
    const accessList = await findAccessLogList({
      StartDate: startDate,
      EndDate: endDate,
    });
    res.json(accessList);
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

//-- find accesslogs --
const findAccessLogList = (data) => {
  return new Promise(async (resolve, reject) => {
    const [rows, fields] = await globalDB
      .promise()
      .query(
        "select ID, Method, PathName, RequestDate, IP from oag_accesslog where " +
          "RequestDate >= ? and RequestDate < ?",
        [data.StartDate, data.EndDate]
      );

    resolve(rows);
  });
};
//-- end find accesslog --
