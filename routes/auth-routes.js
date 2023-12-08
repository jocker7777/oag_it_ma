const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controllers");

router.post("/login", authController.logIn); //route to login

module.exports = router;
