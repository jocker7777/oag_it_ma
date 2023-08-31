import * as dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "./env/mariaDB_connection.env" });
dotenv.config({ path: "./env/token_sign.env" });
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connect_db from "./publics/db.connection.js";
import parser from "ua-parser-js";

// -- express setting --
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// -- router --
import authRoutes from "./routes/auth.routes.js";
app.use("/auth", authRoutes);
//app.use("/member", memberRoutes);

// -- check agent --
// app._router.use(async (req, res, next) => {
//   const access_info = parser(req.headers["user-agent"]);
//   if (!access_info.browser?.name?.trim() && !access_info.device?.name?.trim())
//     return res.status(400).end();
//   console.log(typeof access_info.browser.name);
// });

// -- database --
const db_connection = await connect_db().catch((e) => {
  throw new Error("cannot connect to db.");
});
global.globalDB = db_connection;

app.listen(3000);
console.info("Express started on port 3000");
