const express = require("express");
const router = express.Router();
const officeController = require("../controllers/office-controllers");

router.post("/area", officeController.area);
router.post("/section", officeController.section);
router.post("/office", officeController.office);

module.exports = router;
