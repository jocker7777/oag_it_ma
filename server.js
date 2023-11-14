const express = require("express");
var bodyParser = require("body-parser");

const db = require("./connectdb"); // Import the MySQL connection
const app = express();
const port = process.env.PORT || 3500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const usersRoutes = require("./routes/user-routes");
//const mousRoutes = require("./routes/mou-routes");

// การเชื่อมต่อกับ MySQL

app.use("/api/users", usersRoutes); //เรียกเส้นทางไป user routes

// สร้าง API เพื่อดึงข้อมูล
app.get("/api/oag_office", (req, res) => {
  const sql = "SELECT * FROM oag_user LIMIT 10"; // เปลี่ยน mytable เป็นชื่อตารางของคุณ
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
