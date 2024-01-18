const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket-controllers");
const authen = require("../public/authen-middleware");
const permission = require("../public/Permisson.json").ticket;
const ticketStatusPermission = require("../public/Permisson.json").ticket.option
  .trackStatus;
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

router.post(
  "/list",
  authen.checkPermission(permission.list),
  ticketController.list
);

router.post("/inventorytype", ticketController.inventoryType);

router.post(
  "/option/status",
  authen.checkPermission(ticketStatusPermission),
  ticketController.trackStatus
);

module.exports = router;
