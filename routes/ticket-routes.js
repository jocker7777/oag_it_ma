const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket-controllers");
const authen = require("../public/authen-middleware");
const permission = require("../env/Permisson.json").ticket;

router.post(
  "/create",
  authen.checkPermission(permission.create),
  ticketController.create
);

router.post(
  "/update/data",
  authen.checkPermission(permission.update.data),
  ticketController.updateData
);

router.post(
  "/update/status",
  authen.checkPermission(permission.update.data),
  ticketController.updateStatus
);

module.exports = router;
