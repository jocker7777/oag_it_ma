//const HttpError = require("../models/http-error");
//const Member = require("../models/Member");
//const bcrypt = require('bcrypt');

//-----------------------------------sipup--------------------
const signup = async (req, res, next) => {
le.log(req.body); //req.body คือค่าทั้งหมดที่ส่งมาจาก front

  const data = req.body.data;
  console.log("test2");

  const firstName = data.firstName;
  const surName = data.surName;
  const idCard = data.idCard;
  const userName = data.userName;
  const password = data.password;
 
  const hash = bcrypt.hashSync(password,10); //เข้ารหัสpassword ด้วย bcry
 
  const agency = data.agency;
  const birthday = data.birthday;
  const tel = data.tel;
  const email = data.email;
  const typeUser = data.typeUser;
  const createDate = now = new Date();
  
  let existingUser;
  try {
    existingUser = await Member.findOne({ idCard: idCard });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.aaaaaaa",
      500
    );
    return next(error);
  }



  const createdMember = new Member({
    firstName,
    surName,
    email,
    userName,
    hash,
    agency,
    birthday,
    tel,
    typeUser,
    idCard,
    createDate
  });
  await createdMember.save();
  try {
    await createdMember.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again.joooo",
      500
    );
    return next(error);
  }
  res.status(201).json({ Member: createdMember.toObject({ getters: true }) });
  console.log("finish");

 
};

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
      return res.status(401).json({ message: 'Authentication failed.' });
    }
    console.log('User Found')

    const passwordMatch = await bcrypt.compare(password,user.hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    res.status(200).json({ message: 'Authentication successful.' });
    console.log('finish')
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};


 //-------------readall---------------
 const readall = async (req, res) => {
  // const id = parseInt(req.body.id);
  // const client = new MongoClient(uri);
  // await client.connect();
  // const users = await client.db("mydb").collection("users").find({}).toArray();
  // await client.close();
  console.log('finish');

  //const users = await Mou.find({});

  //res.status(200).send(users);
};

  


 

exports.signup = signup;
exports.login = login;
exports.readall = readall;
