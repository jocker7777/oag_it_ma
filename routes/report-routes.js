const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report-controllers");
const authen = require("../public/authen-middleware");
const logPermission = require("../public/Permisson.json").report.log.access;
const searchPermission = require("../public/Permisson.json").report.search;
const trackStatusOptionPermission = require("../public/Permisson.json").report
  .option.trackStatus;
router.post(
  "/log/access",
  authen.checkPermission(logPermission),
  reportController.accessLog
);

router.post(
  "/search",
  authen.checkPermission(searchPermission),
  reportController.reportSearch
);
router.post(
  "/option/status",
  authen.checkPermission(trackStatusOptionPermission),
  reportController.trackStatus
);

module.exports = router;
