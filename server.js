const express = require("express");
const db = require("./connectdb"); // Import the MySQL connection
const app = express();
const cors = require("cors");
const bodyParserErrorHandler = require("express-body-parser-error-handler");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  // skip: (req) => req.path === '/api/auth/login', // Skip rate limiting for /public-path
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({ error: `Rate limit exceeded, please try again in ${options.windowMs / 1000} seconds` });
  },
  statusCode: 429 // Default status code for rate limit exceeded
});

const port = process.env.PORT || 3001;
global.environment = "dev"; // please change to production on production
//-- config express data handler and origin --//
const bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(
  cors(
    {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST",
      optionsSuccessStatus: 204,
    })
);
app.use(limiter);
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
//-- log --//
const accessLog = require("./public/access-log").accessLog;
app.use(accessLog);

//-- end log //

//-- config request data type --//

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const usersRoutes = require("./routes/user-routes");
const authRoutes = require("./routes/auth-routes");
const ticketRoutes = require("./routes/ticket-routes");
const officeRoutes = require("./routes/office-routes");
const reportRoutes = require("./routes/report-routes");
const userTestRoutes = require("./routes/user-test-routes");
//const mousRoutes = require("./routes/mou-routes");

// การเชื่อมต่อกับ MySQL

app.use("/api/users", usersRoutes); //เรียกเส้นทางไป user routes
app.use("/api/auth", authRoutes); //เรียกเส้นทางไป Auth( login ) routes
app.use("/api/ticket", ticketRoutes); //เรียกเส้นทางไป ticket routes
app.use("/api/office", officeRoutes); //เรียกเส้นทางไป office routes
app.use("/api/report", reportRoutes);
app.use("/api/usertest", userTestRoutes);
// สร้าง API เพื่อดึงข้อมูล
// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, async (req, res) => {
  console.log(`Server is running on port running ${port}`);
});
