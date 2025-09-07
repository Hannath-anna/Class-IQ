const adminController = require("../controllers/admin.controller");
const router = require("express").Router();

// router.get("/", adminController.getAdmin);
router.post("/signup", adminController.signup);
router.post("/verify-otp", adminController.verifyOtpAndSignup);
router.post("/login", adminController.login);
// router.post("/forget-password", adminController.forgotPasswordRequest);
// router.post("/reset-password", adminController.resetPassword);

module.exports = router;