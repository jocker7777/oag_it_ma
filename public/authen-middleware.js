const jwt = require("jsonwebtoken");
const keyToSign =
  "kalfskgpowi501291502103i01j2iorjafo9w8u719247urqwujfanlzckvdhgiur93q";

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

module.exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, keyToSign, function (err, decoded) {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

module.exports.checkPermission = (req, res, next) => {
  try {
    if (!req.headers.authorization) return res.status(401).end();
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, keyToSign, function (err, decoded) {
      if (err) return res.status(401).end();
      req.body.tokenData = decoded;
      next();
    });
  } catch (e) {
    res.status(401).end();
  }
};
