const router = require("express").Router();
const authController = require("../controllers/auth.controller")

router.get("/", authController.getAllUsers);
router.post("/otp-request", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtpAndSignup);
router.post("/login", authController.login);
router.post("/forget-password", authController.forgotPasswordRequest);
router.post("/reset-password", authController.resetPassword);

module.exports = router;