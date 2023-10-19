const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3500;

const usersRoutes = require("./routes/user-routes");
//const mousRoutes = require("./routes/mou-routes");

// การเชื่อมต่อกับ MySQL
const db = mysql.createConnection({
  connectionLimit: 10,
  host: "172.16.10.151",
  port: 3306,
  user: "eticket",
  password: "p@ssw0rd",
  database: "eticket",
  insecureAuth: true,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  global.globalDB = db;
  console.log("Connected to MySQL");
});


app.use("/api/users", usersRoutes); //เรียกเส้นทางไป user routes

// สร้าง API เพื่อดึงข้อมูล
app.get('/api/oag_office', (req, res) => {
  const sql = 'SELECT * FROM oag_user LIMIT 10'; // เปลี่ยน mytable เป็นชื่อตารางของคุณ
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
