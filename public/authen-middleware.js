const jwt = require("jsonwebtoken");

//--- Key use to sign and validate token (should be in env file or folder)---
const keyToSign =
  "kalfskgpowi501291502103i01j2iorjafo9w8u719247urqwujfanlzckvdhgiur93q";

//-- Sign token key --
module.exports.signToken = (data, expireRange = "365d") => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data,
      keyToSign,
      { expiresIn: expireRange },
      function (err, token) {
        if (err) reject({ code: 500 });
        resolve(token);
      }
    );
  });
};
//-- End sign token key --

//-- Verify token --
module.exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, keyToSign, function (err, decoded) {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};
//-- End verify token --

//-- Permission check --
module.exports.checkPermission = (req, res, next) => {
  try {
    //-- Check if token header exist --
    if (!req.headers.authorization) return res.status(401).end();
    const token = req.headers.authorization.split(" ")[1];
    //-- End check token header exist --
    //-- Verify if token valid and push data to req.body.tokenData --
    jwt.verify(token, keyToSign, function (err, decoded) {
      if (err) return res.status(401).end();
      req.body.tokenData = decoded;
      next();
    });
    //-- End verify token --
  } catch (e) {
    //-- if any error occur log and return unauthorize error status --
    res.status(401).end();
    //-- End error handler --
  }
};
//-- End permission check --
