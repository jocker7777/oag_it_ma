const jwt = require("jsonwebtoken");
const fs = require("fs");
const rateLimit = require('express-rate-limit')
const { builtinModules } = require("module");
//Set Blacklisted Token 
const keyToSign =
  global.environment == "dev"
    ? "kalfskgpowi501291502103i01j2iorjafo9w8u719247urqwujfanlzckvdhgiur93q"
    : fs.readFileSync("./env/key_rsa");

//--- Key use to sign and validate token (should be in env file or folder)---
// const keyToSign =
//   "kalfskgpowi501291502103i01j2iorjafo9w8u719247urqwujfanlzckvdhgiur93q";

//-- Sign token key --
module.exports.signToken = (data, expireRange = "1d") => {
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
module.exports.loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message: 'login has been reach to limit please contact admin'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send(options.message)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
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
  const blackListed = new Set();
  return (req, res, next) => {
    try {
      //-- Check if token header exist --
      // if (!req.body.token) return res.status(401).end();
      const token = req.headers.authorization.split(" ")[1]; //for use with correct auth later
      // const token = req.body.token;
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
