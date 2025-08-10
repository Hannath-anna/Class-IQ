const courseController = require("../controllers/couse.controller");
const router = require("express").Router();
const upload = require('../middleware/upload.js');

router.get("/", courseController.findAll);
// router.post("/", upload, courseController.create);

module.exports = router;