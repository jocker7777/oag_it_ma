import express from "express";
import * as register from "../controllers/member/register.controllers.js";
//import { verifyToken } from "../publics/token.middleware.js";

// -- router main path = member/* --
const router = express.Router();

// -- insecure route --
router.post("/register", register.register);
