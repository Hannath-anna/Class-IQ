const profileController = require("../controllers/profile.controller.js");
const profileUpload = require("../middleware/profileUpload.js");
const router = require("express").Router();

router.get("/", profileController.get);
router.put("/", profileUpload, profileController.update);

module.exports = router;