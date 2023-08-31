import express from "express";
import * as login from "../controllers/auth/login.controllers.js";
//import { logout } from "../controllers/auth/logout.controller";
//import { verifyToken } from "../publics/token.middleware.js";

// -- router main path = auth/* --
const router = express.Router();
// -- insecure route --
router.post("/login", login.login);
router.post("/preLogin", login.preLogin);

// -- secure route --
//router.get("/logout/", verifyToken, logout);

export default router;
