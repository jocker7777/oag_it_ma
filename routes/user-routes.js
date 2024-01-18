const express = require("express");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.post("/sigup", usersController.signup); //เส้นทางไป Control 
router.post("/login", usersController.login); //เส้นทางไป Control 
router.get("/readall", usersController.readall); //เส้นทางไป Control 



module.exports = router;
