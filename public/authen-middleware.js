const jwt = require("jsonwebtoken");
const fs = require("fs");
const keyToSign =
  global.environment == "dev"
    ? "kalfskgpowi501291502103i01j2iorjafo9w8u719247urqwujfanlzckvdhgiur93q"
    : fs.readFileSync("./env/key_rsa");

//--- Key use to sign and validate token (should be in env file or folder)---
// const keyToSign =
//   "kalfskgpowi501291502103i01j2iorjafo9w8u719247urqwujfanlzckvdhgiur93q";

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
module.exports.checkPermission = (allowRoles = []) => {
  return (req, res, next) => {
    try {
      //-- Check if token header exist --
      if (!req.headers.authorization) return res.status(401).end();
      const token = req.headers.authorization?.split(" ")[1];
      //const token = req.headers.Authorization;
      //-- End check token header exist --
      //-- Verify if token valid and push data to req.body.tokenData --
      jwt.verify(token, keyToSign, function (err, decoded) {
        if (err) return res.status(401).end();
        req.tokenData = decoded;
        if (allowRoles.length <= 0 || allowRoles.indexOf(decoded?.Role) > -1)
          return next();
        throw 403;
      });
      //-- End verify token --
    } catch (e) {
      //-- if any error occur log and return unauthorize error status --
      if (e == 403) return res.status(403).end();
      res.status(401).end();
      //-- End error handler --
    }
  };
};
//-- End permission check --

module.exports.LogTokenDecode = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, keyToSign, function (err, decoded) {
      if (err) resolve(false);
      resolve(decoded.UserID ?? null);
    });
  });
};
