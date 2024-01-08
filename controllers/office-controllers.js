const yup = require("yup");

module.exports.area = async (req, res) => {
  try {
    //hardcode  0 = ต่างจังหวัด, 1 = กทม , 2 = ทั้งหมด
    res.json([
      { ProvinceID: 0, ProvinceName: "ต่างจังหวัด" },
      { ProvinceID: 1, ProvinceName: "กรุงเทพฯ" },
      { ProvinceID: 2, ProvinceName: "ทั้งหมด" },
    ]);
  } catch (e) {
    //-- if any error occur return server error status --
    res.status(500).end();
    //-- End error handler --
  }
};

module.exports.section = async (req, res) => {
  try {
    const queryData = await yup
      .object({
        ProvinceID: yup.number().default(0).nullable(),
      })
      .validate(req.body)
      .catch((e) => {
        throw { code: 400 };
      });
    const sectionList = await findSectionList(queryData);
    res.json(sectionList);
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

module.exports.office = async (req, res) => {
  try {
    const queryData = await yup
      .object({
        OfficeID: yup.number().default(0).nullable(),
      })
      .validate(req.body)
      .catch((e) => {
        console.log(e);
        throw { code: 400 };
      });
    const officeList = await findOfficeList(queryData);
    res.json(officeList);
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

//-- find section in oag_office (OfficeTypeID = 2) --
const findSectionList = (data) => {
  return new Promise(async (resolve, reject) => {
    const [rows, fields] = await globalDB
      .promise()
      .query(
        "select OfficeID, OfficeName, OfficeNameCode from oag_office " +
          "where ActiveStatus = 0 and OfficeTypeID = ? " +
          (!data.ProvinceID
            ? ""
            : data.ProvinceID === 1
            ? "and ProvinceID = ?"
            : "and ProvinceID <> 1"),
        [2, data.ProvinceID]
      );

    resolve(rows);
  });
};
//-- end find section --

//-- find office in oag_office (OfficeIDLevel2  = officeID) --
const findOfficeList = (data) => {
  return new Promise(async (resolve, reject) => {
    const [rows, fields] = await globalDB
      .promise()
      .query(
        "select OfficeID, OfficeName, OfficeNameCode from oag_office" +
          (data.OfficeID
            ? " where ActiveStatus = 0 and OfficeIDLevel2 = ?"
            : ""),
        [data.OfficeID]
      );

    resolve(rows);
  });
};
//-- end find office --
