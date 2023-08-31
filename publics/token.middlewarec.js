import jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
const key = fs
  .readFileSync(path.resolve((path.resolve(), "env/tokenPrivateKey.key")), {
    encoding: "utf8",
  })
  .toString();

export const signToken = (data, expire) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, key, { expiresIn: expire }, (err, token) => {
      ond;
      if (err) resolve(false);
      resolve(token);
    });
  });
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, (err, data) => {
      if (err) reject(false);
      resolve(data);
    });
  });
};
