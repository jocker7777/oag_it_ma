import express from "express";
import { login } from "../controllers/auth/login.controllers.js";
import { resetPassword } from "../controllers/auth/resetPassword.controller.js";
//import { logout } from "../controllers/auth/logout.controller";
//import { verifyToken } from "../publics/token.middleware.js";

// -- router main path = auth/* --
const router = express.Router();
// -- insecure route --
router.post("/login", login);
router.post("/resetpassword", resetPassword);
// -- secure route --
//router.get("/logout/", verifyToken, logout);

export default router;
