const adminController = require("../controllers/admin.controller");
const router = require("express").Router();

// router.get("/", adminController.getAdmin);
router.post("/signup", adminController.signup);
router.post("/verify-otp", adminController.verifyOtpAndSignup);

module.exports = router;