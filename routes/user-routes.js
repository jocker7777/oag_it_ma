const express = require("express");

const usersController = require("../controllers/users-controllers");

const router = express.Router();
const authen = require("../public/authen-middleware");
const permission = require("../public/Permisson.json").user;

router.post("/createuseradmin",authen.checkPermission(permission.create), usersController.createuseradmin); //เส้นทางไป Control 
router.post("/deleteuseradmin", authen.checkPermission(permission.delete),usersController.deleteuseradmin); //เส้นทางไป Control 
router.post("/searchuser", authen.checkPermission(permission.search),usersController.searchuser); //เส้นทางไป Control 
router.post("/login", authen.checkPermission(permission.update),usersController.login); //เส้นทางไป Control 
router.post("/readall", authen.checkPermission(permission.view),usersController.readall); //เส้นทางไป Control 
router.patch("/update",authen.checkPermission(permission.update),usersController.update);
router.post("/register",usersController.insertUser);




module.exports = router;
