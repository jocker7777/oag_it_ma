//const HttpError = require("../models/http-error");
//const Member = require("../models/Member");
//const bcrypt = require('bcrypt');

const db = require('../connectdb');



//-----------------------------------sipup--------------------
const create = async (req, res, next) => {

  const data = req.body;
  console.table(data); //req.body คือค่าทั้งหมดที่ส่งมาจาก front
  console.table(data.LastName); //req.body คือค่าทั้งหมดที่ส่งมาจาก front
}


//-------------------login-------------------------------------

const login = async (req, res, next) => {
  //console.log(req.body);
  const data = req.body.data;
  const userName = data.userName;
  const password = data.password;

  console.log(userName);
  console.log(password);

  //let existingUser;

  try {
    const user = await Member.findOne({ userName });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed." });
    }
    console.log("User Found");

    const passwordMatch = await bcrypt.compare(password, user.hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    res.status(200).json({ message: "Authentication successful." });
    console.log("finish");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

//-------------readall---------------
const readall = async (req, res) => {
  console.log("finish");
  const sql = 'SELECT * FROM oag_user LIMIT 100';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
 
};

exports.create = create;
exports.login = login;
exports.readall = readall;


