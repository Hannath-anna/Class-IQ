const router = require("express").Router();
const authController = require("../controllers/auth.controller")

router.post("/otp-request", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtpAndSignup);

module.exports = router;