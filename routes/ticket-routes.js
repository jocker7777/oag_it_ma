const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket-controllers");
const authen = require("../public/authen-middleware");
const permission = require("../public/Permisson.json").ticket;
router.post(
  "/create",
  authen.checkPermission(permission.create),
  ticketController.create
);

router.put(
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
router.post(
  "/list/:id",
  authen.checkPermission(permission.list),
  ticketController.single
);

router.post("/inventorytype", ticketController.inventoryType);

router.post(
  "/accept/:id",
  authen.checkPermission(permission.pending),
  ticketController.accept
);

router.post(
  "/option/status",
  authen.checkPermission(permission.option.status),
  ticketController.trackStatus
);

router.post(
  "/ownedlist",
  authen.checkPermission(permission.ownedList),
  ticketController.ownedList
);
router.post(
  "/trackupdate",
  authen.checkPermission(permission.list),
  ticketController.trackUpdate
);
router.post(
  "/complete",
  authen.checkPermission(permission.list),
  ticketController.completeList
)
router.post(
  "/close",
  authen.checkPermission(permission.complete),
  ticketController.closeTicket
)
module.exports = router;
