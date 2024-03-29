const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report-controllers");
const authen = require("../public/authen-middleware");
const logPermission = require("../public/Permisson.json").report.log.access;
const searchPermission = require("../public/Permisson.json").report.search;

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
  "/trackamountbystatus",
  reportController.TrackStatusCount
);

router.post(
  "/trackamountbyinventory",
  reportController.TrackInventoryCount
);

router.post(
  "/trackamountbymonth",
  reportController.TrackByMonth
);

module.exports = router;
