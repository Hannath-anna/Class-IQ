const adminController = require("../controllers/admin.controller");
const router = require("express").Router();
const profileUpload = require("../middleware/profileUpload.js");

// router.get("/", adminController.getAdmin);
router.post("/signup", adminController.signup);
router.post("/verify-otp", adminController.verifyOtpAndSignup);
router.post("/login", adminController.login);
// router.post("/forget-password", adminController.forgotPasswordRequest);
// router.post("/reset-password", adminController.resetPassword);
router.get("/profile", adminController.getProfile)
router.put("/profile", profileUpload, adminController.update);
router.get("/admins", adminController.getAllAdmins)

module.exports = router;