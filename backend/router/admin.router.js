const adminController = require("../controllers/admin.controller");
const router = require("express").Router();

router.get("/", adminController.getAdmin);

module.exports = router;