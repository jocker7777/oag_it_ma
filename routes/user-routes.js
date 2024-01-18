const express = require("express");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.post("/createuseradmin", usersController.createuseradmin); //เส้นทางไป Control 
router.post("/deleteuseradmin", usersController.deleteuseradmin); //เส้นทางไป Control 
router.post("/searchuser", usersController.searchuser); //เส้นทางไป Control 
router.post("/login", usersController.login); //เส้นทางไป Control 
router.get("/readall", usersController.readall); //เส้นทางไป Control 
router.patch("/update",usersController.update);



module.exports = router;
