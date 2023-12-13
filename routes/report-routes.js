const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report-controllers");
const authen = require("../public/authen-middleware");
const permission = require("../public/Permisson.json").report.log.access;

router.post(
  "/log/access",
  authen.checkPermission(permission),
  reportController.accessLog
);

module.exports = router;
