import jwt from "jsonwebtoken";
import * as fs from "fs";

const key = fs.readFileSync("../env/tokenPrivateKey.key");

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
