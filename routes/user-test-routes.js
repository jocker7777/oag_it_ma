const express = require("express");
const router = express.Router();
const userTestController = require("../controllers/user-test-controller");
const authen = require("../public/authen-middleware");
const permission = require("../public/Permisson.json").user;

router.post("/create", userTestController.insertUser);

router.post(
  "/update",
  authen.checkPermission(permission.update),
  userTestController.updateData
);

module.exports = router;
