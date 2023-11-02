const express = require("express");
const db = require("./connectdb"); // Import the MySQL connection
const app = express();
const cors = require("cors");
const bodyParserErrorHandler = require("express-body-parser-error-handler");
const port = process.env.PORT || 3500;
//-- config express data handler and origin --//
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST",
  })
);
app.use(
  bodyParserErrorHandler({
    errorMessage: (err) => {
      console.error(err);
      return undefined;
    },
    onerror: (err, req, res) => {
      return res.status(400).end();
    },
  })
);
//-- config request data type --//

const usersRoutes = require("./routes/user-routes");
const authRoutes = require("./routes/auth-routes");
//const mousRoutes = require("./routes/mou-routes");

// การเชื่อมต่อกับ MySQL

app.use("/api/users", usersRoutes); //เรียกเส้นทางไป user routes
app.use("/api/auth", authRoutes); //เรียกเส้นทางไป Auth( login ) routes
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
